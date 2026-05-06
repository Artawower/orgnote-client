import { expect, test } from 'vitest';
import { getApiBaseUrl, getApiPublicUrl, getWebSocketUrl } from './server-endpoints';

const getExpectedWsProtocol = (): string =>
  window.location.protocol === 'https:' ? 'wss:' : 'ws:';

test('server-endpoints getApiBaseUrl returns trimmed configured url', () => {
  expect(getApiBaseUrl('  https://api.example.com/v1  ')).toBe('https://api.example.com/v1');
});

test('server-endpoints getApiPublicUrl resolves relative api path to window origin', () => {
  const value = getApiPublicUrl('/v1');

  expect(value).toBe(new URL('/v1', window.location.origin).toString());
});

test('server-endpoints getWebSocketUrl normalizes configured http ws url', () => {
  const wsUrl = getWebSocketUrl({
    configuredWsUrl: 'https://sync.example.com/ws/events',
  });

  expect(wsUrl).toBe('wss://sync.example.com/ws/events');
});

test('server-endpoints getWebSocketUrl derives ws from configured api url', () => {
  const wsUrl = getWebSocketUrl({
    configuredApiUrl: 'https://sync.example.com/v1',
  });

  expect(wsUrl).toBe('wss://sync.example.com/ws/events');
});

test('server-endpoints getWebSocketUrl preserves api base path prefix when deriving ws url', () => {
  const wsUrl = getWebSocketUrl({
    configuredApiUrl: 'https://sync.example.com/api/v1',
  });

  expect(wsUrl).toBe('wss://sync.example.com/api/ws/events');
});

test('server-endpoints getWebSocketUrl derives local ws url for /v1 api path', () => {
  const wsUrl = getWebSocketUrl({
    configuredApiUrl: '/v1',
  });

  expect(wsUrl).toBe(`${getExpectedWsProtocol()}//${window.location.host}/api/ws/events`);
});
