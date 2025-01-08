import { useLoadingMessages } from 'src/composables/use-loading-messages';
import { LOADING_MESSAGE_1 } from 'orgnote-api';
import { test, expect, vi } from 'vitest';
import { withSetup } from 'src/test-utils/with-setup';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

test('default messages are used when none are provided', () => {
  const [result] = withSetup(() => useLoadingMessages());
  const { currentMessage, timer } = result;

  expect(currentMessage.value).toBe(LOADING_MESSAGE_1);
  expect(timer.value).toBe(3000);
});

test('custom messages are used if provided', () => {
  const customMessages = ['Custom message 1', 'Custom message 2'];
  const [result] = withSetup(() => useLoadingMessages({ messages: customMessages, timer: 5000 }));
  const { currentMessage, timer } = result;

  expect(timer.value).toBe(5000);
  expect(customMessages).toContain(currentMessage.value);
});

test('rotation stops when component is unmounted', () => {
  vi.useFakeTimers();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, app] = withSetup(() =>
    useLoadingMessages({ messages: ['Message A', 'Message B'], timer: 1000 }),
  );

  const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

  app.unmount();
  expect(clearIntervalSpy).toHaveBeenCalledTimes(1);

  vi.useRealTimers();
});
