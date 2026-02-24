import { expect, test, vi } from 'vitest';
import type { OrgNoteApi } from 'orgnote-api';
import { buildLocalSyncProfileToml } from './local-sync-profile-config';

const createApi = () => {
  const configStore = {
    config: {
      network: {
        apiUrl: 'https://sync.example.com/v1',
        wsUrl: '',
      },
      synchronization: {
        type: 'none',
      },
      developer: {
        developerMode: true,
      },
    },
  };

  const authStore = {
    token: 'token-123',
    verifyUser: vi.fn(async () => undefined),
  };

  const api = {
    core: {
      useConfig: () => configStore,
      useAuth: () => authStore,
    },
  } as unknown as OrgNoteApi;

  return { api, configStore, authStore };
};

test('local-sync-profile-config buildLocalSyncProfileToml creates parseable profile from stores', () => {
  const { api } = createApi();

  const toml = buildLocalSyncProfileToml(api);

  expect(toml).toContain('[[accounts]]');
  expect(toml).toContain('name = "default"');
  expect(toml).toContain(`clientAddress = "${window.location.origin}"`);
  expect(toml).toContain('remoteAddress = "https://sync.example.com/v1"');
  expect(toml).toContain('token = "token-123"');
  expect(toml).toContain('debug = true');
  expect(toml).toContain('logPath = "/tmp/log/orgnote"');
  expect(toml).toContain('backupDir = ""');
  expect(toml).toContain('backupCount = 3');
});
