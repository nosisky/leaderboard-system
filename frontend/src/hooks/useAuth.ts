import { useState, useEffect } from 'react';

export interface User {
  idToken: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  username?: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('nebula_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setState(prev => ({ ...prev, user }));
      } catch (error) {
        localStorage.removeItem('nebula_user');
      }
    }
  }, []);

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error, loading: false }));
  };

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const signup = async (email: string, password: string, username: string, name: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setLoading(false);
      return { success: true, message: data.message };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      const user: User = {
        idToken: data.idToken,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresIn: data.expiresIn,
        username
      };

      localStorage.setItem('nebula_user', JSON.stringify(user));
      setState(prev => ({ ...prev, user, loading: false }));

      return { success: true, user };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const confirm = async (username: string, code: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Confirmation failed');
      }

      setLoading(false);
      return { success: true, message: data.message };
    } catch (error: any) {
      setError(error.message);
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('nebula_user');
    setState({ user: null, loading: false, error: null });
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    login,
    signup,
    confirm,
    logout,
    setError
  };
}
