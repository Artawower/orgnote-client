import { to } from 'orgnote-api/utils';

const wsPathLocal = '/api/ws/events';
const wsPathRemote = '/ws/events';

export const getApiBaseUrl = (configured?: string): string =>
  configured?.trim() || import.meta.env.VITE_API_URL || '/v1';

export const getApiPublicUrl = (configured?: string): string => {
  const baseUrl = getApiBaseUrl(configured);

  if (baseUrl.startsWith('http')) {
    return baseUrl;
  }

  if (typeof window !== 'undefined') {
    return new URL(baseUrl, window.location.origin).toString();
  }

  return baseUrl;
};

const toWsProtocol = (url: string): string => url.replace(/^http/, 'ws');

const deriveWsFromApiUrl = (apiUrl?: string): string => {
  const parsed = to(() => new URL(getApiPublicUrl(apiUrl)))();

  if (parsed.isErr()) {
    throw new Error(`Invalid WebSocket URL derived from: ${apiUrl}`);
  }

  const url = parsed.value;
  url.protocol = toWsProtocol(url.protocol);
  url.pathname = getApiBaseUrl(apiUrl) === '/v1' ? wsPathLocal : wsPathRemote;

  return url.toString();
};

export const getWebSocketUrl = (options?: {
  configuredWsUrl?: string;
  configuredApiUrl?: string;
}): string => {
  const wsUrl = options?.configuredWsUrl?.trim() || import.meta.env.WS_URL;

  if (wsUrl) {
    return toWsProtocol(wsUrl);
  }

  return deriveWsFromApiUrl(options?.configuredApiUrl);
};
