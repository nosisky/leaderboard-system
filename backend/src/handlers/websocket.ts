import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, PutItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { logger } from "../logger";

const dynamo = new DynamoDBClient({ region: process.env.REGION || "eu-north-1" });
const TABLE = process.env.CONNECTIONS_TABLE || "websocket-connections";

export const connect: APIGatewayProxyHandler = async (event) => {
  logger.info("Connecting to websocket", { event });
  const connectionId = event.requestContext?.connectionId;
  if (!connectionId) return { statusCode: 400, body: JSON.stringify({ error: "Missing connection ID" }) };

  try {
    await dynamo.send(new PutItemCommand({
      TableName: TABLE,
      Item: {
        connectionId: { S: connectionId },
        ttl: { N: Math.floor(Date.now() / 1000 + 86400).toString() }, // 24h
      },
      ConditionExpression: "attribute_not_exists(connectionId)"
    }));
    return { statusCode: 200, body: JSON.stringify({ message: "Connected" }) };
  } catch (err: any) {
    if (err.name === "ConditionalCheckFailedException") return { statusCode: 200, body: JSON.stringify({ message: "Already connected" }) };
    return { statusCode: 500, body: JSON.stringify({ error: "Connection failed" }) };
  }
};

export const disconnect: APIGatewayProxyHandler = async (event) => {
  const connectionId = event.requestContext?.connectionId;
  if (!connectionId) return { statusCode: 400, body: JSON.stringify({ error: "Missing connection ID" }) };

  await dynamo.send(new DeleteItemCommand({ TableName: TABLE, Key: { connectionId: { S: connectionId } } }));
  return { statusCode: 200, body: JSON.stringify({ message: "Disconnected" }) };
};

export const message: APIGatewayProxyHandler = async () => {
  return { statusCode: 200, body: JSON.stringify({ message: "Message received" }) };
};
