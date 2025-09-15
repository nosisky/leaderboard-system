import React, { useState } from 'react';
import { User } from '../hooks/useAuth';

interface ScoreSubmissionProps {
  user: User;
  onSuccess: () => void;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export function ScoreSubmission({ user, onSuccess }: ScoreSubmissionProps) {
  const [score, setScore] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const scoreValue = parseInt(score);
      
      if (isNaN(scoreValue) || scoreValue < 0) {
        throw new Error('Please enter a valid score (0 or higher)');
      }

      const response = await fetch(`${API_BASE_URL}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.idToken}`,
        },
        body: JSON.stringify({ score: scoreValue }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Score submission failed');
      }

      setScore('');
      onSuccess();

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          🎯 Submit Your Score
        </h3>
        <p className="text-gray-600 text-sm">
          Scores above 1000 will be broadcast to all users in real-time!
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-md bg-red-100 text-red-700 border border-red-300">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Score
          </label>
          <input
            type="number"
            required
            min="0"
            value={score}
            onChange={(e) => setScore(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your score (e.g., 1500)"
          />
          <p className="text-xs text-gray-500 mt-1">
            💡 Tip: Try submitting a score above 1000 to see the WebSocket broadcast!
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !score}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Submitting...' : '🚀 Submit Score'}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-md">
        <h4 className="font-medium text-blue-800 mb-2">💡 How it works:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Submit any score to save it to the leaderboard</li>
          <li>• Scores above 1000 trigger real-time notifications</li>
          <li>• All connected users will see high score alerts</li>
          <li>• Check the leaderboard tab to see top scores</li>
        </ul>
      </div>
    </div>
  );
}
