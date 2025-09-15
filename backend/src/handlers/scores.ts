import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { broadcastToAllConnectionsHybrid, WebSocketMessage, requireAuth } from "../utils";
import { logger } from "../logger";

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME!;
const WEBSOCKET_URL = process.env.WEBSOCKET_API_URL!;
const dynamo = new DynamoDBClient({ region: process.env.DYNAMODB_REGION || "eu-north-1" });

const baseHeaders = { "Access-Control-Allow-Origin": "*" };

export const submitScore: APIGatewayProxyHandler = async (event) => {
  try {
    const authUser = await requireAuth(event);
    if (!event.body) return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: "Request body required" }) };

    const { score } = JSON.parse(event.body);

    if (score == null || score < 0 || typeof score !== 'number') {
      return { statusCode: 400, headers: baseHeaders, body: JSON.stringify({ error: "Valid score required" }) };
    }

    const id = uuidv4();
    const timestamp = Date.now();

    await dynamo.send(new PutItemCommand({
      TableName: TABLE_NAME,
      Item: {
        id: { S: id },
        user_id: { S: authUser.userId },
        user_name: { S: authUser.username },
        score: { N: score.toString() },
        timestamp: { N: timestamp.toString() },
      },
    }));

    if (score > 1000) {
      const message: WebSocketMessage = {
        type: "HIGH_SCORE",
        user_name: authUser.username,
        user_id: authUser.userId,
        score,
        timestamp,
        message: `${authUser.username} just scored ${score} points!`
      };
      await broadcastToAllConnectionsHybrid(message, WEBSOCKET_URL);
    }

    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ message: "Score submitted", scoreId: id }) };
  } catch (err: any) {
    return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ error: err.message }) };
  }
};

export const getLeaderboard: APIGatewayProxyHandler = async (event) => {
  try {
    const authUser = await requireAuth(event);
    
    

    const result = await dynamo.send(new ScanCommand({ TableName: TABLE_NAME }));
    const items = result.Items || [];

    const leaderboard = items
      .sort((a, b) => parseInt(b.score?.N || '0') - parseInt(a.score?.N || '0'))
      .slice(0, 1) 
      .map(item => ({
        id: item.id?.S,
        userId: item.user_id?.S,
        userName: item.user_name?.S,
        score: parseInt(item.score?.N || '0'),
        timestamp: parseInt(item.timestamp?.N || '0')
      }));

    return { statusCode: 200, headers: baseHeaders, body: JSON.stringify({ leaderboard, totalEntries: items.length }) };
  } catch (err: any) {
    return { statusCode: 500, headers: baseHeaders, body: JSON.stringify({ error: err.message }) };
  }
};
