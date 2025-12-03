import { setActivePinia, createPinia } from 'pinia';
import { useNotificationsStore } from './notifications';
import { notify as notiwindNotify } from 'notiwind';
import { test, expect, vi, beforeEach } from 'vitest';

vi.mock('notiwind', () => ({
  notify: vi.fn(),
}));

vi.mock('./config', async () => {
  const { ref } = await import('vue');
  return {
    useConfigStore: vi.fn(() => ({
      config: ref({ ui: { notificationTimeout: 3000 } }),
    })),
  };
});

beforeEach(() => {
  setActivePinia(createPinia());
  vi.clearAllMocks();
});

test('NotificationsStore notify calls notiwind with correct params', () => {
  const store = useNotificationsStore();

  store.notify({
    message: 'Test message',
    level: 'info',
  });

  expect(notiwindNotify).toHaveBeenCalledWith(
    {
      group: 'main',
      title: 'Test message',
      text: undefined,
      type: 'info',
    },
    3000,
  );
  expect(store.notifications).toHaveLength(1);
  expect(store.notifications[0]?.config.message).toBe('Test message');
  expect(store.notifications[0]?.read).toBe(false);
});

test('NotificationsStore notify uses custom timeout', () => {
  const store = useNotificationsStore();

  store.notify({
    message: 'Test',
    timeout: 5000,
  });

  expect(notiwindNotify).toHaveBeenCalledWith(
    expect.objectContaining({ title: 'Test' }),
    5000,
  );
});

test('NotificationsStore notify passes description as text', () => {
  const store = useNotificationsStore();

  store.notify({
    message: 'Title',
    description: 'Description text',
  });

  expect(notiwindNotify).toHaveBeenCalledWith(
    expect.objectContaining({
      title: 'Title',
      text: 'Description text',
    }),
    3000,
  );
});

test('NotificationsStore notify generates id when not provided', () => {
  const store = useNotificationsStore();

  store.notify({ message: 'Test' });

  expect(store.notifications[0]?.config.id).toMatch(/^notification-\d+$/);
});

test('NotificationsStore notify uses provided id', () => {
  const store = useNotificationsStore();

  store.notify({ message: 'Test', id: 'custom-id' });

  expect(store.notifications[0]?.config.id).toBe('custom-id');
});

test('NotificationsStore clear removes all notifications', () => {
  const store = useNotificationsStore();

  store.notify({ message: 'Message 1' });
  store.notify({ message: 'Message 2' });

  expect(store.notifications).toHaveLength(2);

  store.clear();

  expect(store.notifications).toHaveLength(0);
});

test('NotificationsStore delete removes specific notification by id', () => {
  const store = useNotificationsStore();

  store.notify({ message: 'Message 1', id: 'id-1' });
  store.notify({ message: 'Message 2', id: 'id-2' });

  expect(store.notifications).toHaveLength(2);

  store.delete('id-1');

  expect(store.notifications).toHaveLength(1);
  expect(store.notifications[0]?.config.id).toBe('id-2');
});

test('NotificationsStore delete does nothing when id not found', () => {
  const store = useNotificationsStore();

  store.notify({ message: 'Test', id: 'test-id' });

  store.delete('non-existent-id');

  expect(store.notifications).toHaveLength(1);
});

test('NotificationsStore markAsRead marks notification as read', () => {
  const store = useNotificationsStore();

  store.notify({ message: 'Test', id: 'test-id' });

  expect(store.notifications[0]?.read).toBe(false);

  store.markAsRead('test-id');

  expect(store.notifications[0]?.read).toBe(true);
});

test('NotificationsStore markAsRead does nothing when id not found', () => {
  const store = useNotificationsStore();

  store.notify({ message: 'Test', id: 'test-id' });

  store.markAsRead('non-existent-id');

  expect(store.notifications[0]?.read).toBe(false);
});

test('NotificationsStore supports different notification levels', () => {
  const store = useNotificationsStore();
  const levels = ['info', 'warning', 'danger'] as const;

  levels.forEach((level) => {
    vi.clearAllMocks();
    store.notify({ message: `${level} message`, level });

    expect(notiwindNotify).toHaveBeenCalledWith(
      expect.objectContaining({ type: level }),
      3000,
    );
  });
});
