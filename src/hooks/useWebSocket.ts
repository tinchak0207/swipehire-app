/**
 * useWebSocket Hook
 *
 * Provides WebSocket functionality with automatic reconnection,
 * connection state management, and error handling.
 *
 * @param url - The WebSocket URL
 * @param options - Configuration options
 * @returns WebSocket state and utilities
 */

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseWebSocketOptions {
  onOpen?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  onError?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  shouldReconnect?: (closeEvent: CloseEvent) => boolean;
  reconnectInterval?: number;
  reconnectAttempts?: number;
  enabled?: boolean;
}

export interface UseWebSocketReturn {
  sendMessage: (message: string) => void;
  sendJsonMessage: (message: object) => void;
  lastMessage: MessageEvent | null;
  readyState: number;
  isConnected: boolean;
  isConnecting: boolean;
  isDisconnected: boolean;
  reconnect: () => void;
  disconnect: () => void;
}

const READY_STATE_CONNECTING = 0;
const READY_STATE_OPEN = 1;
const READY_STATE_CLOSED = 3;

export function useWebSocket(url: string, options: UseWebSocketOptions = {}): UseWebSocketReturn {
  const {
    onOpen,
    onMessage,
    onError,
    onClose,
    shouldReconnect = () => true,
    reconnectInterval = 3000,
    reconnectAttempts = 5,
    enabled = true,
  } = options;

  const [lastMessage, setLastMessage] = useState<MessageEvent | null>(null);
  const [readyState, setReadyState] = useState<number>(READY_STATE_CLOSED);
  const [reconnectCount, setReconnectCount] = useState(0);

  const webSocketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const shouldReconnectRef = useRef(shouldReconnect);
  const reconnectAttemptsRef = useRef(reconnectAttempts);

  // Update refs when options change
  useEffect(() => {
    shouldReconnectRef.current = shouldReconnect;
    reconnectAttemptsRef.current = reconnectAttempts;
  }, [shouldReconnect, reconnectAttempts]);

  const connect = useCallback(() => {
    if (!enabled || !url) {
      return;
    }

    try {
      const ws = new WebSocket(url);
      webSocketRef.current = ws;
      setReadyState(READY_STATE_CONNECTING);

      ws.onopen = (event) => {
        setReadyState(READY_STATE_OPEN);
        setReconnectCount(0);
        onOpen?.(event);
      };

      ws.onmessage = (event) => {
        setLastMessage(event);
        onMessage?.(event);
      };

      ws.onerror = (event) => {
        onError?.(event);
      };

      ws.onclose = (event) => {
        setReadyState(READY_STATE_CLOSED);
        onClose?.(event);

        // Attempt to reconnect if conditions are met
        if (
          shouldReconnectRef.current(event) &&
          reconnectCount < reconnectAttemptsRef.current &&
          enabled
        ) {
          setReconnectCount((prev) => prev + 1);
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('WebSocket connection error:', error);
      setReadyState(READY_STATE_CLOSED);
    }
  }, [url, enabled, onOpen, onMessage, onError, onClose, reconnectInterval, reconnectCount]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
    }

    setReadyState(READY_STATE_CLOSED);
    setReconnectCount(0);
  }, []);

  const reconnect = useCallback(() => {
    disconnect();
    setReconnectCount(0);
    connect();
  }, [disconnect, connect]);

  const sendMessage = useCallback(
    (message: string) => {
      if (webSocketRef.current && readyState === READY_STATE_OPEN) {
        webSocketRef.current.send(message);
      } else {
        console.warn('WebSocket is not connected. Message not sent:', message);
      }
    },
    [readyState]
  );

  const sendJsonMessage = useCallback(
    (message: object) => {
      try {
        sendMessage(JSON.stringify(message));
      } catch (error) {
        console.error('Error serializing message to JSON:', error);
      }
    },
    [sendMessage]
  );

  // Connect on mount and when enabled/url changes
  useEffect(() => {
    if (enabled && url) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, url, connect, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  const isConnected = readyState === READY_STATE_OPEN;
  const isConnecting = readyState === READY_STATE_CONNECTING;
  const isDisconnected = readyState === READY_STATE_CLOSED;

  return {
    sendMessage,
    sendJsonMessage,
    lastMessage,
    readyState,
    isConnected,
    isConnecting,
    isDisconnected,
    reconnect,
    disconnect,
  };
}

export default useWebSocket;
