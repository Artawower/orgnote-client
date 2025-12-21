import { WebSocketClient } from 'orgnote-api';
import { logger } from 'src/boot/logger';

export let wsClient: WebSocketClient;

const buildWsUrl = (): string => {
  if (import.meta.env.WS_URL) {
    return import.meta.env.WS_URL;
  }

  if (typeof window === 'undefined') {
    return 'ws://localhost:8000/ws/events';
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/ws/events`;
};

export const initWebSocketClient = () => {
  const wsUrl = buildWsUrl();
  wsClient = new WebSocketClient(wsUrl, logger);
  return wsClient;
};
