import React, { useState } from 'react';

interface AuthProps {
  onLogin: (username: string, password: string) => Promise<any>;
  onSignup: (email: string, password: string, username: string, name: string) => Promise<any>;
  onConfirm: (username: string, code: string) => Promise<any>;
}

export function Auth({ onLogin, onSignup, onConfirm }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup' | 'confirm'>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: '',
    code: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      let result;

      if (mode === 'login') {
        result = await onLogin(formData.username, formData.password);
      } else if (mode === 'signup') {
        result = await onSignup(formData.email, formData.password, formData.username, formData.name);
      } else {
        result = await onConfirm(formData.username, formData.code);
      }

      if (result.success) {
        setMessage({ text: result.message || 'Success!', type: 'success' });
        
        if (mode === 'signup') {
          setMode('confirm');
          setMessage({ text: 'Check your email for confirmation code', type: 'success' });
        }
      } else {
        setMessage({ text: result.error || 'Operation failed', type: 'error' });
      }
    } catch (error: any) {
      setMessage({ text: error.message || 'An error occurred', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      username: '',
      name: '',
      code: ''
    });
    setMessage(null);
  };

  const switchMode = (newMode: 'login' | 'signup' | 'confirm') => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {mode === 'login' && '🔐 Login'}
          {mode === 'signup' && '📝 Sign Up'}
          {mode === 'confirm' && '✅ Confirm Account'}
        </h2>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-md ${
          message.type === 'success' 
            ? 'bg-green-100 text-green-700 border border-green-300'
            : 'bg-red-100 text-red-700 border border-red-300'
        }`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
              />
            </div>
          </>
        )}

        {(mode === 'login' || mode === 'signup') && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
            </div>
          </>
        )}

        {mode === 'confirm' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmation Code
              </label>
              <input
                type="text"
                required
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="123456"
                maxLength={6}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳ Processing...' : (
            mode === 'login' ? '🔐 Login' :
            mode === 'signup' ? '📝 Sign Up' :
            '✅ Confirm'
          )}
        </button>
      </form>

      <div className="mt-4 text-center text-sm">
        {mode === 'login' && (
          <p className="text-gray-600">
            Don't have an account?{' '}
            <button
              onClick={() => switchMode('signup')}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </p>
        )}
        
        {mode === 'signup' && (
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={() => switchMode('login')}
              className="text-blue-600 hover:underline"
            >
              Login
            </button>
          </p>
        )}

        {mode === 'confirm' && (
          <p className="text-gray-600">
            Need to sign up again?{' '}
            <button
              onClick={() => switchMode('signup')}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
