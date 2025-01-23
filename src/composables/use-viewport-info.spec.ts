import { vi, test, expect, beforeEach, afterEach } from 'vitest';
import { useViewportInfo } from './use-viewport-info';
import { withSetup } from '../../test/with-setup';

const platform = vi.hoisted(() => ({
  mobile: true,
  electron: false,
}));

beforeEach(() => {
  vi.stubGlobal('process', { env: { CLIENT: true } });

  Object.defineProperty(document, 'body', {
    value: {
      classList: {
        add: vi.fn(),
        remove: vi.fn(),
      },
      style: {
        setProperty: vi.fn(),
        height: '',
      },
    },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  // Restore all mocks after each test
  vi.restoreAllMocks();
});

test('handles non-mobile environments correctly', () => {
  vi.stubGlobal('process', { env: { CLIENT: false } });
  vi.stubGlobal('window', {});

  const [result] = withSetup(useViewportInfo);

  expect(result.viewportHeight.value).toBe(0);
  expect(result.keyboardOpened.value).toBe(false);
});

test('detects keyboard open state on mobile', () => {
  vi.mock('quasar', () => ({
    useQuasar: () => ({
      platform: {
        is: platform,
      },
    }),
  }));
  const eventCallback = vi.fn();
  const mockVisualViewport = {
    height: 500,
    addEventListener: eventCallback,
    removeEventListener: vi.fn(),
  };

  vi.stubGlobal('window', {
    innerHeight: 600,
    visualViewport: mockVisualViewport,
    screen: { availHeight: 800 },
    scrollTo: vi.fn(),
  });

  const callback = vi.fn();

  const [result] = withSetup(() => useViewportInfo(callback));

  expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  const resizeHandler = mockVisualViewport.addEventListener.mock.calls[0][1];
  resizeHandler();

  expect(result.keyboardOpened.value).toBe(true);
  expect(result.viewportHeight.value).toBe(500);
  expect(callback).toHaveBeenCalledWith(result);
});

test('handles electron platform offset', () => {
  const mockVisualViewport = {
    height: 500,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };

  platform.electron = true;

  vi.stubGlobal('window', {
    innerHeight: 600,
    visualViewport: mockVisualViewport,
    screen: { availHeight: 800 },
    scrollTo: vi.fn(),
  });

  const [result] = withSetup(useViewportInfo);
  expect(mockVisualViewport.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));

  const resizeHandler = mockVisualViewport.addEventListener.mock.calls[0][1];
  resizeHandler();

  expect(result.viewportHeight.value).toBe(468);
});
