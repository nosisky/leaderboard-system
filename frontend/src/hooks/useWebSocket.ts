import { useState, useEffect, useRef } from 'react';

export interface WebSocketMessage {
  type: string;
  user_name?: string;
  user_id?: string;
  score?: number;
  timestamp?: number;
  message?: string;
  connectionId?: string;
}

const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:8080';

export function useWebSocket(token?: string) {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'Connecting' | 'Open' | 'Closed' | 'Error'>('Closed');
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      ws.current = new WebSocket(WS_URL);
      setConnectionStatus('Connecting');

      ws.current.onopen = () => {
        setConnectionStatus('Open');
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          setLastMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        setConnectionStatus('Closed');

        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 3000);
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('Error');
      };

    } catch (error) {
      console.error('WebSocket connection failed:', error);
      setConnectionStatus('Error');
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
    
    setConnectionStatus('Closed');
  };

  // Connect when component mounts or token changes
  useEffect(() => {
    if (token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    lastMessage,
    connectionStatus,
    connect,
    disconnect
  };
}
