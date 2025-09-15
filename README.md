# 🏆 Nebula Leaderboard

A full-stack real-time leaderboard application with user authentication, score tracking, and live updates.

## 📋 Overview

Nebula is a modern web application that allows users to:
- Register and authenticate securely
- Submit scores in real-time competitions
- View live leaderboards with rankings
- Receive instant notifications for high scores
- Experience responsive design across all devices

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- AWS Account (for full deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nebula
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   # Copy and configure env.example to .env
   npm run dev
   ```

3. **Setup Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## 📁 Project Structure

```
nebula/
├── backend/                    # Node.js/Express API server
│   ├── src/
│   │   ├── handlers/          # Lambda handlers (auth, scores, websocket)
│   │   ├── utils.ts           # Utility functions
│   │   ├── logger.ts          # Winston logging
│   │   └── app.ts             # Express server
│   ├── template.yaml          # AWS SAM template
│   └── package.json
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── App.tsx           # Main app component
│   │   └── index.tsx         # App entry point
│   ├── build/                # Production build output
│   ├── tailwind.config.js    # Tailwind configuration
│   └── package.json
│
└── README.md                  # This file
```


## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **WebSocket** - Real-time communication
- **Create React App** - Build tool

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **AWS Lambda** - Serverless functions
- **AWS DynamoDB** - NoSQL database
- **AWS Cognito** - User authentication
- **AWS API Gateway** - WebSocket API
- **Winston** - Logging

### DevOps
- **AWS SAM** - Serverless deployment
- **Render/Vercel/Netlify** - Frontend hosting
- **GitHub Actions** - CI/CD (optional)

## 🚀 Deployment

### Frontend (Static Site)
```bash
cd frontend
npm run build
# Deploy build/ folder to:
# - Render (Static Site)
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
```

### Backend (Serverless)
```bash
cd backend
npm run build
sam deploy --guided
# Or deploy to:
# - AWS Lambda
# - Render (Web Service)
# - Docker container
```

### Environment Variables
```env
# Frontend (.env)
REACT_APP_API_URL=https://your-api-url
REACT_APP_WS_URL=wss://your-websocket-url

# Backend (.env)
AWS_REGION=eu-north-1
DYNAMODB_TABLE=leaderboard
COGNITO_USER_POOL_ID=your-pool-id
COGNITO_CLIENT_ID=your-client-id
```

---
