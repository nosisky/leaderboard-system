import React, { useState, useEffect, useCallback } from 'react';
import { User } from '../hooks/useAuth';

interface LeaderboardEntry {
  id: string;
  userId: string;
  userName: string;
  score: number;
  timestamp: number;
}

interface LeaderboardProps {
  user: User;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export function Leaderboard({ user }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${user.idToken}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }

      setLeaderboard(data.leaderboard || []);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, [user.idToken]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          🏆 Top Scores
        </h3>
        <button
          onClick={fetchLeaderboard}
          disabled={loading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50"
        >
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {loading && leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 text-sm mt-2">Loading...</p>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">🎯</div>
          <p className="text-gray-600 text-sm">No scores yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((entry, index) => (
            <div key={entry.id} className="bg-white rounded-lg p-4 shadow-sm border">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                  </span>
                  <div>
                    <div className="font-medium text-gray-900">
                      {entry.userName}
                      {entry.userId === user.username && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          You
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatDate(entry.timestamp)}
                    </div>
                  </div>
                </div>

                <div className="text-lg font-bold text-green-600">
                  {entry.score.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
