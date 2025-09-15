import React, { useState } from 'react';
import { User } from '../hooks/useAuth';
import { ScoreSubmission } from './ScoreSubmission';
import { Leaderboard } from './Leaderboard';

interface DashboardProps {
  user: User;
  onLogout: () => void;
  onScoreSubmit: () => void;
}

export function Dashboard({ user, onLogout, onScoreSubmit }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'submit' | 'leaderboard'>('submit');

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Welcome, {user.username}! 🙌🏽
            </h2>
            <p className="text-gray-600">
              Submit your scores and compete with others
            </p>
          </div>
          <button
            onClick={onLogout}
            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
             Logout
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'submit'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🎯 Submit Score
            </button>
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${
                activeTab === 'leaderboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🏆 Leaderboard
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'submit' && (
            <ScoreSubmission 
              user={user} 
              onSuccess={onScoreSubmit}
            />
          )}
          
          {activeTab === 'leaderboard' && (
            <Leaderboard user={user} />
          )}
        </div>
      </div>

      {/* WebSocket Status */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">
            🔌 Connected to WebSocket - Real-time notifications enabled
          </span>
        </div>
      </div>
    </div>
  );
}
