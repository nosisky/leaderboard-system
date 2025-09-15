import {
  DynamoDBClient,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { createHmac } from "crypto";
import jwt from "jsonwebtoken";
import jwkToPem from "jwk-to-pem";
import axios from "axios";
import { logger } from "./logger";


const dynamo = new DynamoDBClient({
  region: process.env.REGION || "eu-north-1",
});
const CONNECTIONS_TABLE =
  process.env.CONNECTIONS_TABLE || "websocket-connections";

export interface WebSocketMessage {
  type: string;
  user_name: string;
  score: number;
  timestamp: number;
  message?: string;
  user_id?: string;
  connection_id?: string;
}

export interface ConnectionRecord {
  connectionId: string;
  connectedAt: number;
  lastSeen: number;
  userId?: string;
  userAgent?: string;
  ipAddress?: string;
  ttl: number;
}

export interface AuthResult {
  isAuthenticated: boolean;
  userId?: string;
  email?: string;
  username?: string;
  error?: string;
}

export async function authenticateUser(event: any): Promise<AuthResult> {
  try {
    const authHeader =
      event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return { isAuthenticated: false, error: "Bearer token required" };

    const token = authHeader.slice(7);
    const decodedHeader = jwt.decode(token, { complete: true })?.header;
    if (!decodedHeader?.kid)
      return { isAuthenticated: false, error: "Missing key ID in token" };

    const userPoolId = process.env.COGNITO_USER_POOL_ID!;
    const clientId = process.env.COGNITO_CLIENT_ID!;
    const region = process.env.COGNITO_REGION || "eu-north-1";
    const jwksUrl = `https://cognito-idp.${region}.amazonaws.com/${userPoolId}/.well-known/jwks.json`;

    const jwksResponse = await axios.get(jwksUrl, { timeout: 5000 });
    const key = jwksResponse.data.keys.find(
      (k: any) => k.kid === decodedHeader.kid
    );
    if (!key) return { isAuthenticated: false, error: "Key not found in JWKS" };

    const pem = jwkToPem(key);
    const decoded = jwt.verify(token, pem, {
      issuer: `https://cognito-idp.${region}.amazonaws.com/${userPoolId}`,
      audience: clientId,
      algorithms: ["RS256"],
    }) as any;

    const userId = decoded.sub || decoded["cognito:username"];
    const email = decoded.email;
    const username =
      decoded["cognito:username"] || decoded.preferred_username || decoded.sub;

    if (!userId || !email || !username)
      return { isAuthenticated: false, error: "Incomplete user info in token" };

    return { isAuthenticated: true, userId, email, username };
  } catch (err: any) {
    logger.error("Authentication failed", { error: err.message });
    return {
      isAuthenticated: false,
      error: err.message || "Authentication failed",
    };
  }
}

export async function requireAuth(
  event: any
): Promise<{ userId: string; email: string; username: string }> {
  const auth = await authenticateUser(event);
  if (!auth.isAuthenticated)
    throw new Error(auth.error || "Authentication required");
  return { userId: auth.userId!, email: auth.email!, username: auth.username! };
}

export function sanitizeInput(input: string): string {
  return (
    input
      ?.replace(/[<>'"&]/g, "")
      .trim()
      .substring(0, 255) || ""
  );
}

export function validateUsername(username: string): string | null {
  const sanitized = sanitizeInput(username);
  if (!sanitized) return "Username is required";
  if (sanitized.length < 3) return "Username must be at least 3 characters";
  if (sanitized.length > 50) return "Username must be less than 50 characters";
  if (!/^[a-zA-Z0-9_-]+$/.test(sanitized))
    return "Username can only contain letters, numbers, _ and -";
  return null;
}

export function validateEmail(email: string): string | null {
  const sanitized = sanitizeInput(email);
  if (!sanitized) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) return "Invalid email";
  if (sanitized.length > 100) return "Email must be less than 100 characters";
  return null;
}

export function validatePassword(password: string): string | null {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must have an uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must have a lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must have a number";
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password))
    return "Password must have a special character";
  return null;
}

export function calculateSecretHash(
  username: string,
  clientId: string,
  clientSecret: string
): string {
  return createHmac("sha256", clientSecret)
    .update(username + clientId)
    .digest("base64");
}

export async function getActiveConnections(): Promise<ConnectionRecord[]> {
  try {
    const scanCommand = new ScanCommand({
      TableName: CONNECTIONS_TABLE,
      FilterExpression: "#ttl > :now",
      ExpressionAttributeNames: { "#ttl": "ttl" },
      ExpressionAttributeValues: {
        ":now": { N: Math.floor(Date.now() / 1000).toString() },
      },
    });
    const result = await dynamo.send(scanCommand);

    return (result.Items || []).map((item) => ({
      connectionId: item.connectionId?.S!,
      connectedAt: parseInt(item.connectedAt?.N || "0"),
      lastSeen: parseInt(item.lastSeen?.N || Date.now().toString()),
      userId: item.userId?.S,
      userAgent: item.userAgent?.S,
      ipAddress: item.ipAddress?.S,
      ttl: parseInt(item.ttl?.N || "0"),
    }));
  } catch (err: any) {
    logger.error("Failed to fetch active connections", { error: err.message });
    return [];
  }
}

export async function broadcastToAllConnections(
  message: WebSocketMessage,
  websocketUrl?: string
) {
  try {
    const WEBSOCKET_URL = websocketUrl || process.env.WEBSOCKET_API_URL;
    if (!WEBSOCKET_URL) {
      logger.error("No websocket URL found", { websocketUrl, WEBSOCKET_URL });
      return;
    };

    const connections = await getActiveConnections();
    if (!connections.length) {
      logger.error("No active connections found");
      return;
    }

    const wsClient = new ApiGatewayManagementApiClient({
      endpoint: WEBSOCKET_URL.replace("wss://", "https://").replace(
        "/production",
        ""
      ),
    });
    logger.info("Broadcasting to all connections", { connections: connections.length });

    await Promise.all(
      connections.map((conn) =>
        wsClient
          .send(
            new PostToConnectionCommand({
              ConnectionId: conn.connectionId,
              Data: Buffer.from(JSON.stringify(message)),
            })
          )
          .catch(() => {})
      )
    );
  } catch (error) {
    logger.error("Failed to broadcast to all connections", { error: error });
  }
}

export async function broadcastToAllConnectionsHybrid(message: any, websocketUrl?: string) {
  const useAwsSocket = process.env.USE_AWS_SOCKET === 'true';

  if (!useAwsSocket) {
    // For single-port server, broadcasting is handled in app.ts
  } else {
    await broadcastToAllConnections(message, websocketUrl);
  }
}



