import { test, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGlobalSwipe } from './use-global-swipe';
import type { PanEventDetails } from './use-drawer-gesture';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

const createTouchEvent = (
  type: 'touchstart' | 'touchmove' | 'touchend',
  x: number,
  y: number,
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

  return {
    type,
    touches: type === 'touchend' ? ({ length: 0 } as TouchList) : touchList,
    changedTouches: touchList,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    composedPath: () => [],
    bubbles: true,
    cancelable: true,
  } as unknown as TouchEvent;
};

const createTestComponent = (onPan: (details: PanEventDetails) => void, enabled: () => boolean) =>
  defineComponent({
    setup() {
      useGlobalSwipe({ onPan, enabled });
      return () => null;
    },
  });

const dispatchTouchEvent = (type: 'touchstart' | 'touchmove' | 'touchend', x: number, y: number) => {
  document.dispatchEvent(createTouchEvent(type, x, y));
};

beforeEach(() => {
  vi.useFakeTimers();
  vi.spyOn(window, 'getSelection').mockReturnValue({
    toString: () => '',
  } as Selection);
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

test('useGlobalSwipe should not call onPan when disabled', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => false));

  dispatchTouchEvent('touchstart', 0, 100);
  dispatchTouchEvent('touchmove', 50, 100);
  dispatchTouchEvent('touchend', 50, 100);

  expect(onPan).not.toHaveBeenCalled();
  wrapper.unmount();
});

test('useGlobalSwipe should call onPan with isFirst=true on first horizontal move', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 0, 100);
  dispatchTouchEvent('touchmove', 20, 100);

  expect(onPan).toHaveBeenCalledTimes(1);
  expect(onPan).toHaveBeenCalledWith(
    expect.objectContaining({
      isFirst: true,
      isFinal: false,
      direction: 'right',
    }),
  );
  wrapper.unmount();
});

test('useGlobalSwipe should detect left swipe direction', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 100, 100);
  dispatchTouchEvent('touchmove', 80, 100);

  expect(onPan).toHaveBeenCalledWith(
    expect.objectContaining({
      direction: 'left',
    }),
  );
  wrapper.unmount();
});

test('useGlobalSwipe should detect right swipe direction', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 0, 100);
  dispatchTouchEvent('touchmove', 20, 100);

  expect(onPan).toHaveBeenCalledWith(
    expect.objectContaining({
      direction: 'right',
    }),
  );
  wrapper.unmount();
});

test('useGlobalSwipe should not call onPan for vertical swipes', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 100, 0);
  dispatchTouchEvent('touchmove', 100, 50);
  dispatchTouchEvent('touchend', 100, 50);

  expect(onPan).not.toHaveBeenCalled();
  wrapper.unmount();
});

test('useGlobalSwipe should not call onPan when movement is below threshold', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 100, 100);
  dispatchTouchEvent('touchmove', 105, 102);

  expect(onPan).not.toHaveBeenCalled();
  wrapper.unmount();
});

test('useGlobalSwipe should call onPan with isFinal=true on touchend', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 0, 100);
  dispatchTouchEvent('touchmove', 20, 100);
  dispatchTouchEvent('touchend', 50, 100);

  expect(onPan).toHaveBeenCalledTimes(2);
  expect(onPan).toHaveBeenLastCalledWith(
    expect.objectContaining({
      isFirst: false,
      isFinal: true,
    }),
  );
  wrapper.unmount();
});

test('useGlobalSwipe should call onPan multiple times during continuous drag', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 0, 100);
  dispatchTouchEvent('touchmove', 20, 100);
  dispatchTouchEvent('touchmove', 40, 100);
  dispatchTouchEvent('touchmove', 60, 100);

  expect(onPan).toHaveBeenCalledTimes(3);
  expect(onPan.mock.calls[0]?.[0]).toMatchObject({ isFirst: true });
  expect(onPan.mock.calls[1]?.[0]).toMatchObject({ isFirst: false });
  expect(onPan.mock.calls[2]?.[0]).toMatchObject({ isFirst: false });
  wrapper.unmount();
});

test('useGlobalSwipe should include correct offset values', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 100, 100);
  dispatchTouchEvent('touchmove', 150, 105);

  expect(onPan).toHaveBeenCalledWith(
    expect.objectContaining({
      offset: { x: 50, y: 5 },
    }),
  );
  wrapper.unmount();
});

test('useGlobalSwipe should include offset values', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 100, 100);
  dispatchTouchEvent('touchmove', 150, 105);

  expect(onPan).toHaveBeenCalledWith(
    expect.objectContaining({
      offset: { x: 50, y: 5 },
    }),
  );
  wrapper.unmount();
});

test('useGlobalSwipe should not call onPan when there is text selection', () => {
  const onPan = vi.fn();
  vi.spyOn(window, 'getSelection').mockReturnValue({
    toString: () => 'selected text',
  } as Selection);

  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 0, 100);
  dispatchTouchEvent('touchmove', 50, 100);

  expect(onPan).not.toHaveBeenCalled();
  wrapper.unmount();
});

test('useGlobalSwipe should not call onPan when textarea has selection', () => {
  const onPan = vi.fn();
  const textarea = document.createElement('textarea');
  textarea.value = 'some text';
  textarea.selectionStart = 0;
  textarea.selectionEnd = 4;
  document.body.appendChild(textarea);
  textarea.focus();

  vi.spyOn(window, 'getSelection').mockReturnValue({
    toString: () => '',
  } as Selection);

  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 0, 100);
  dispatchTouchEvent('touchmove', 50, 100);

  expect(onPan).not.toHaveBeenCalled();

  document.body.removeChild(textarea);
  wrapper.unmount();
});

test('useGlobalSwipe should remove event listeners on unmount', () => {
  const onPan = vi.fn();
  const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');

  const wrapper = mount(createTestComponent(onPan, () => true));
  wrapper.unmount();

  expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
  expect(removeEventListenerSpy).toHaveBeenCalledWith('touchmove', expect.any(Function));
  expect(removeEventListenerSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
});

test('useGlobalSwipe should reset state after touchend', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 0, 100);
  dispatchTouchEvent('touchmove', 20, 100);
  dispatchTouchEvent('touchend', 50, 100);

  onPan.mockClear();

  dispatchTouchEvent('touchstart', 0, 100);
  dispatchTouchEvent('touchmove', 20, 100);

  expect(onPan).toHaveBeenCalledWith(
    expect.objectContaining({
      isFirst: true,
    }),
  );
  wrapper.unmount();
});

test('useGlobalSwipe should handle touchend without prior horizontal swipe', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 100, 0);
  dispatchTouchEvent('touchmove', 100, 50);
  dispatchTouchEvent('touchend', 100, 100);

  expect(onPan).not.toHaveBeenCalled();
  wrapper.unmount();
});

test('useGlobalSwipe should include duration in pan details', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchstart', 0, 100);
  vi.advanceTimersByTime(500);
  dispatchTouchEvent('touchmove', 20, 100);

  expect(onPan).toHaveBeenCalledWith(
    expect.objectContaining({
      duration: 500,
    }),
  );
  wrapper.unmount();
});

test('useGlobalSwipe should handle touchmove without touchstart', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchmove', 50, 100);

  expect(onPan).not.toHaveBeenCalled();
  wrapper.unmount();
});

test('useGlobalSwipe should handle touchend without touchstart', () => {
  const onPan = vi.fn();
  const wrapper = mount(createTestComponent(onPan, () => true));

  dispatchTouchEvent('touchend', 50, 100);

  expect(onPan).not.toHaveBeenCalled();
  wrapper.unmount();
});
