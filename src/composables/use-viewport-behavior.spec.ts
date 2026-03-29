import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { useViewportBehavior, useKeyboardState } from './use-viewport-behavior';

vi.mock('src/utils/platform-detection', () => ({
  platform: { is: { ios: true, safari: true, capacitor: false } },
  platformMatch: async (handlers: { default: () => unknown }) => handlers.default(),
}));

vi.mock('src/utils/android-keyboard-hide', () => ({
  isKeyboardHideWindowActive: vi.fn(() => false),
}));

import { isKeyboardHideWindowActive } from 'src/utils/android-keyboard-hide';

const createTouchEvent = (
  type: 'touchstart' | 'touchmove' | 'touchend',
  x: number,
  y: number,
  target?: Element,
): TouchEvent => {
  const touch = { clientX: x, clientY: y } as Touch;
  const touchList = {
    0: touch,
    length: 1,
    item: () => touch,
    [Symbol.iterator]: function* () {
      yield touch;
    },
  } as unknown as TouchList;

  const event = {
    type,
    touches: type === 'touchend' ? ({ length: 0 } as TouchList) : touchList,
    changedTouches: touchList,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    bubbles: true,
    cancelable: true,
    composedPath: () => (target ? [target] : []),
  } as unknown as TouchEvent;

  if (target) {
    Object.defineProperty(event, 'target', { value: target, configurable: true });
  }

  return event;
};

const createTestComponent = () =>
  defineComponent({
    setup() {
      useViewportBehavior();
      return () => null;
    },
  });

beforeEach(() => {
  Object.defineProperty(window, 'visualViewport', {
    value: {
      height: 800,
      offsetTop: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    },
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true });
  Object.defineProperty(window.navigator, 'standalone', {
    value: false,
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test('useViewportBehavior should not prevent default for horizontal-only scroll target', () => {
  const scrollable = document.createElement('div');
  scrollable.style.overflowX = 'auto';
  scrollable.style.overflowY = 'hidden';
  Object.defineProperty(scrollable, 'scrollWidth', { value: 500, configurable: true });
  Object.defineProperty(scrollable, 'clientWidth', { value: 300, configurable: true });
  Object.defineProperty(scrollable, 'scrollHeight', { value: 100, configurable: true });
  Object.defineProperty(scrollable, 'clientHeight', { value: 100, configurable: true });
  document.body.appendChild(scrollable);

  const wrapper = mount(createTestComponent());

  document.dispatchEvent(createTouchEvent('touchstart', 100, 100, scrollable));
  const moveEvent = createTouchEvent('touchmove', 100, 150, scrollable);
  document.dispatchEvent(moveEvent);

  expect(moveEvent.preventDefault).not.toHaveBeenCalled();

  document.body.removeChild(scrollable);
  wrapper.unmount();
});

test('useViewportBehavior should prevent default at vertical boundary', () => {
  const scrollable = document.createElement('div');
  scrollable.style.overflowY = 'auto';
  scrollable.style.overflowX = 'hidden';
  Object.defineProperty(scrollable, 'scrollHeight', { value: 500, configurable: true });
  Object.defineProperty(scrollable, 'clientHeight', { value: 300, configurable: true });
  Object.defineProperty(scrollable, 'scrollTop', { value: 0, configurable: true });
  document.body.appendChild(scrollable);

  const wrapper = mount(createTestComponent());

  document.dispatchEvent(createTouchEvent('touchstart', 100, 100, scrollable));
  const moveEvent = createTouchEvent('touchmove', 100, 150, scrollable);
  document.dispatchEvent(moveEvent);

  expect(moveEvent.preventDefault).toHaveBeenCalled();

  document.body.removeChild(scrollable);
  wrapper.unmount();
});

test('useViewportBehavior skips keyboard-open state update during hide window', () => {
  vi.mocked(isKeyboardHideWindowActive).mockReturnValueOnce(true);

  Object.defineProperty(window, 'visualViewport', {
    value: { height: 300, offsetTop: 0, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    configurable: true,
  });

  const wrapper = mount(createTestComponent());

  const { keyboardOpened } = useKeyboardState();
  expect(keyboardOpened.value).toBe(false);

  wrapper.unmount();
  document.body.classList.remove('keyboard-opened');
});

test('useViewportBehavior locks viewport height for ios standalone pwa keyboard state', () => {
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();

  Object.defineProperty(window.navigator, 'standalone', {
    value: true,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(window, 'visualViewport', {
    value: { height: 300, offsetTop: 0, addEventListener, removeEventListener },
    configurable: true,
  });

  const wrapper = mount(createTestComponent());

  expect(document.documentElement.style.height).toBe('300px');
  expect(document.documentElement.style.maxHeight).toBe('300px');
  expect(document.body.style.height).toBe('300px');
  expect(document.body.style.maxHeight).toBe('300px');
  expect(addEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));

  wrapper.unmount();

  expect(removeEventListener).toHaveBeenCalledWith('scroll', expect.any(Function));
});

test('useViewportBehavior corrects stuck viewport offset after keyboard closes', () => {
  const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});

  Object.defineProperty(window.navigator, 'standalone', {
    value: true,
    configurable: true,
    writable: true,
  });

  Object.defineProperty(window, 'visualViewport', {
    value: { height: 800, offsetTop: 24, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    configurable: true,
  });

  const wrapper = mount(createTestComponent());

  expect(scrollBySpy).toHaveBeenNthCalledWith(1, 0, -1);
  expect(scrollBySpy).toHaveBeenNthCalledWith(2, 0, 1);

  wrapper.unmount();
});

test('useViewportBehavior does not correct stuck viewport offset outside standalone pwa', () => {
  const scrollBySpy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {});
  const addEventListener = vi.fn();
  const removeEventListener = vi.fn();

  Object.defineProperty(window, 'visualViewport', {
    value: { height: 800, offsetTop: 24, addEventListener, removeEventListener },
    configurable: true,
  });

  const wrapper = mount(createTestComponent());

  expect(scrollBySpy).not.toHaveBeenCalled();
  expect(addEventListener).not.toHaveBeenCalledWith('scroll', expect.any(Function));

  wrapper.unmount();

  expect(removeEventListener).not.toHaveBeenCalledWith('scroll', expect.any(Function));
});
