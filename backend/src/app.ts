import 'dotenv/config';
import express from 'express';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import cors from 'cors';
import { signup, login, confirm } from "./handlers/auth";
import { submitScore, getLeaderboard } from "./handlers/scores";
import { requireAuth } from "./utils";

const app = express();
const server = createServer(app);

const wsConnections = new Map();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', connections: wsConnections.size });
});

async function wrapLambdaHandler(handler: any, req: any, res: any) {
  try {
    const mockEvent = {
      body: JSON.stringify(req.body),
      headers: req.headers,
      httpMethod: req.method,
      path: req.path,
      multiValueHeaders: {},
      isBase64Encoded: false,
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: req.path
    };

    const result = await handler(mockEvent, {} as any, () => {});

    if (result) {
      res.status(result.statusCode || 200);
      if (result.headers) res.set(result.headers);
      res.json(JSON.parse(result.body || '{}'));
    } else {
      res.status(500).json({ error: 'Handler returned no result' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

app.post('/signup', (req, res) => wrapLambdaHandler(signup, req, res));
app.post('/login', (req, res) => wrapLambdaHandler(login, req, res));
app.post('/confirm', (req, res) => wrapLambdaHandler(confirm, req, res));


app.post('/submit', async (req, res) => {
  try {
    const mockEvent = {
      body: JSON.stringify(req.body),
      headers: req.headers as any,
      httpMethod: 'POST',
      path: '/submit',
      multiValueHeaders: {},
      isBase64Encoded: false,
      pathParameters: null,
      queryStringParameters: null,
      multiValueQueryStringParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '/submit'
    };

    const result = await submitScore(mockEvent, {} as any, () => {});


    if (result && result.statusCode === 200) {
      const { score } = req.body;
      if (score > 1000) {
        try {
          const authUser = await requireAuth(mockEvent);
          const message = {
            type: "HIGH_SCORE",
            user_name: authUser.username,
            user_id: authUser.userId,
            score,
            timestamp: Date.now(),
            message: `${authUser.username} just scored ${score} points!`
          };

          broadcastToAllConnections(message);
        } catch (authError) {
          console.log('Auth error during broadcast:', authError);
        }
      }
    }

    if (result) {
      res.status(result.statusCode || 200);
      if (result.headers) res.set(result.headers);
      res.json(JSON.parse(result.body || '{}'));
    } else {
      res.status(500).json({ error: 'Handler returned no result' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/leaderboard', (req, res) => wrapLambdaHandler(getLeaderboard, req, res));

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  const connectionId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  wsConnections.set(connectionId, ws);

  ws.send(JSON.stringify({
    type: 'CONNECTED',
    connectionId,
    message: 'Connected to WebSocket server'
  }));

  ws.on('close', () => {
    wsConnections.delete(connectionId);
  });

  ws.on('error', () => {
    wsConnections.delete(connectionId);
  });
});

function broadcastToAllConnections(message: any) {
  const messageStr = JSON.stringify(message);
  let sent = 0;

  for (const [connectionId, ws] of wsConnections) {
    try {
      if (ws.readyState === 1) {
        ws.send(messageStr);
        sent++;
      }
    } catch (error) {
      wsConnections.delete(connectionId);
    }
  }

  console.log(`Broadcast sent to ${sent} connections`);
}

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`HTTP API: http://localhost:${PORT}`);
  console.log(`WebSocket: ws://localhost:${PORT}`);
});

export default app;
