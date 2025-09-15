import React, { useState, useEffect } from 'react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { Toast, Modal } from './components/Modal';
import { useWebSocket } from './hooks/useWebSocket';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, login, signup, confirm, logout } = useAuth();
  const { lastMessage } = useWebSocket(user?.idToken);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [modal, setModal] = useState<{ message: string; type: 'success' | 'info'; title?: string } | null>(null);

  useEffect(() => {
    if (lastMessage && lastMessage.type === 'HIGH_SCORE') {
      setModal({
        message: `${lastMessage.user_name} just scored ${lastMessage.score} points!`,
        type: 'success',
        title: 'High Score Alert!'
      });
    }
  }, [lastMessage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            🏆 Nebula Leaderboard
          </h1>
          <p className="text-gray-600">
            Submit your scores and compete in real-time!
          </p>
        </header>

        {!user ? (
          <Auth onLogin={login} onSignup={signup} onConfirm={confirm} />
        ) : (
          <Dashboard
            user={user}
            onLogout={logout}
            onScoreSubmit={() => {
              setToast({
                message: 'Score submitted successfully!',
                type: 'success'
              });
              // Auto-hide toast after 3 seconds
              setTimeout(() => setToast(null), 3000);
            }}
          />
        )}

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}

        {modal && (
          <Modal
            message={modal.message}
            type={modal.type}
            title={modal.title}
            onClose={() => setModal(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
