# AWS Lambda Backend

This is a Node.js/TypeScript backend for AWS Lambda with Cognito authentication, DynamoDB storage, and WebSocket notifications.

## Environment Variables

Copy the `env.example` file to `.env` and configure the following environment variables:

### Required Environment Variables

```bash
# AWS Cognito Configuration
COGNITO_REGION=eu-north-1
COGNITO_CLIENT_ID=your_cognito_client_id
COGNITO_CLIENT_SECRET=your_cognito_client_secret

# AWS DynamoDB Configuration
DYNAMODB_REGION=eu-north-1
DYNAMODB_TABLE_NAME=leaderboard

# AWS API Gateway WebSocket Configuration
WEBSOCKET_API_URL=https://your-websocket-api-id.execute-api.region.amazonaws.com/stage
```

### Setting up Environment Variables

1. Copy the example file:
   ```bash
   cp env.example .env
   ```

2. Update the values in `.env` with your actual AWS resource identifiers

3. For AWS Lambda deployment, set these environment variables in your Lambda function configuration

### Environment Variable Validation

The application will throw errors at startup if required environment variables are missing:

- `COGNITO_CLIENT_ID` and `COGNITO_CLIENT_SECRET` are required
- `WEBSOCKET_API_URL` is required
- `COGNITO_REGION`, `DYNAMODB_REGION`, and `DYNAMODB_TABLE_NAME` have default values but can be overridden

### Required vs Optional Variables

**Required:**
- `COGNITO_CLIENT_ID`
- `COGNITO_CLIENT_SECRET`
- `WEBSOCKET_API_URL`

**Optional (with defaults):**
- `COGNITO_REGION` (default: eu-north-1)
- `DYNAMODB_REGION` (default: eu-north-1)
- `DYNAMODB_TABLE_NAME` (default: leaderboard)

## Development

### Install Dependencies
```bash
npm install
```

### Development Mode
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

### Test Build
```bash
npm run test-build
```

### Test Environment Variables
```bash
npm run test-env
```

## API Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /login` - Authenticate user and return JWT tokens

### Scores & Leaderboard
- `POST /scores` - Submit a score (triggers WebSocket notification if score > 1000)
- `GET /leaderboard` - Get top 1 score from leaderboard

## AWS Resources Required

- **AWS Cognito User Pool** with an App Client
- **AWS DynamoDB Table** named `leaderboard` with the following structure:
  - `id` (String) - Primary key
  - `user_id` (String)
  - `user_name` (String)
  - `score` (Number)
  - `timestamp` (Number)
- **AWS API Gateway WebSocket API** for real-time notifications

