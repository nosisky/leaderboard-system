# 🏆 Nebula Leaderboard Frontend

A modern, responsive React application for real-time leaderboard competitions with user authentication and live score tracking.

## ✨ Features

- **🔐 User Authentication** - Signup, login, and secure user management with AWS Cognito
- **📊 Real-time Leaderboard** - Live score updates and rankings
- **🎯 Score Submission** - Submit scores with instant feedback
- **📡 WebSocket Notifications** - Real-time alerts for high scores (>1000 points)
- **📱 Responsive Design** - Works perfectly on desktop and mobile devices
- **🎨 Modern UI** - Clean design with Tailwind CSS and smooth animations
- **🚀 Production Ready** - Optimized build with clean code

## 🛠️ Tech Stack

- **React 19** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **AWS Cognito** - User authentication and authorization
- **WebSocket** - Real-time communication
- **Create React App** - Build tool and development server

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nebula/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   REACT_APP_API_URL=http://localhost:8080
   REACT_APP_WS_URL=ws://localhost:8080
   ```

4. **Start Development Server**
   ```bash
   npm start
   ```

   The app will open at [http://localhost:3000](http://localhost:3000)

## 📋 Available Scripts

```bash
npm start      # Start development server
npm run build  # Create production build
npm test       # Run tests
```


## 🎯 Features Overview

### Authentication
- User registration with email verification
- Secure login/logout
- JWT token management
- Protected routes

### Score Management
- Submit scores with validation
- Real-time leaderboard updates
- Top scores display with rankings
- Score formatting and statistics

### Real-time Notifications
- **Toast Notifications**: Score submission feedback (slide-in from right)
- **Modal Popups**: High score alerts (full-screen popup)
- WebSocket connection with auto-reconnect
- Live score broadcasting

## 🎨 UI Components

- **Toast**: Non-intrusive notifications for user actions
- **Modal**: Prominent alerts for important events
- **Leaderboard**: Clean, card-based score display
- **Auth Forms**: Responsive login/signup interface
- **Score Submission**: Simple, intuitive score input

## 🔧 Configuration

### Environment Variables
```env
REACT_APP_API_URL=http://localhost:8080  # Backend API URL
REACT_APP_WS_URL=ws://localhost:8080     # WebSocket URL
```

### Tailwind Configuration
The app uses Tailwind CSS with custom animations and responsive design utilities.

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

### Serve Static Files
```bash
npm install -g serve
serve -s build
```

## 📝 License

This project is part of the Nebula Leaderboard application.

---

**Made with ❤️ using React & TypeScript**
