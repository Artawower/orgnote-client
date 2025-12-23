import { useDynamicComponent } from './dynamic-component';
import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { defineComponent, h, ref } from 'vue';

describe('useDynamicComponent', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  describe('mount', () => {
    test('should return object with mount function', () => {
      const { mount } = useDynamicComponent();

      expect(mount).toBeDefined();
      expect(typeof mount).toBe('function');
    });

    test('should mount component to DOM element', () => {
      const TestComponent = defineComponent({
        render: () => h('span', { class: 'test-content' }, 'Hello'),
      });

      const { mount } = useDynamicComponent();
      mount(TestComponent, container);

      expect(container.querySelector('.test-content')).toBeTruthy();
      expect(container.textContent).toBe('Hello');
    });

    test('should pass props to mounted component', () => {
      const TestComponent = defineComponent({
        props: {
          message: String,
          count: Number,
        },
        render() {
          return h('div', {}, `${this.message}: ${this.count}`);
        },
      });

      const { mount } = useDynamicComponent();
      mount(TestComponent, container, { message: 'Items', count: 42 });

      expect(container.textContent).toBe('Items: 42');
    });

    test('should return DynamicComponentInstance with destroy and refresh', () => {
      const TestComponent = defineComponent({
        render: () => h('div', {}, 'Test'),
      });

      const { mount } = useDynamicComponent();
      const instance = mount(TestComponent, container);

      expect(instance).toBeDefined();
      expect(typeof instance.destroy).toBe('function');
      expect(typeof instance.refresh).toBe('function');
    });

    test('should mount multiple components to different elements', () => {
      const container2 = document.createElement('div');
      document.body.appendChild(container2);

      const Component1 = defineComponent({
        render: () => h('span', {}, 'First'),
      });
      const Component2 = defineComponent({
        render: () => h('span', {}, 'Second'),
      });

      const { mount } = useDynamicComponent();
      mount(Component1, container);
      mount(Component2, container2);

      expect(container.textContent).toBe('First');
      expect(container2.textContent).toBe('Second');

      container2.remove();
    });

    test('should work with reactive props', async () => {
      const TestComponent = defineComponent({
        props: { value: Number },
        render() {
          return h('span', {}, String(this.value));
        },
      });

      const { mount } = useDynamicComponent();
      const reactiveValue = ref(1);

      mount(TestComponent, container, { value: reactiveValue.value });

      expect(container.textContent).toBe('1');
    });

    test('should mount component without props', () => {
      const TestComponent = defineComponent({
        render: () => h('div', { class: 'no-props' }, 'No props component'),
      });

      const { mount } = useDynamicComponent();
      mount(TestComponent, container);

      expect(container.querySelector('.no-props')).toBeTruthy();
      expect(container.textContent).toBe('No props component');
    });

    test('should mount component with undefined props', () => {
      const TestComponent = defineComponent({
        render: () => h('div', {}, 'Content'),
      });

      const { mount } = useDynamicComponent();
      mount(TestComponent, container, undefined);

      expect(container.textContent).toBe('Content');
    });

    test('should mount component with empty props object', () => {
      const TestComponent = defineComponent({
        render: () => h('div', {}, 'Empty props'),
      });

      const { mount } = useDynamicComponent();
      mount(TestComponent, container, {});

      expect(container.textContent).toBe('Empty props');
    });
  });

  describe('destroy', () => {
    test('should remove component from DOM when destroyed', () => {
      const TestComponent = defineComponent({
        render: () => h('div', { class: 'destroyable' }, 'Will be destroyed'),
      });

      const { mount } = useDynamicComponent();
      const instance = mount(TestComponent, container);

      expect(container.querySelector('.destroyable')).toBeTruthy();

      instance.destroy();

      expect(container.querySelector('.destroyable')).toBeFalsy();
      expect(container.textContent).toBe('');
    });

    test('should call unmount lifecycle hooks', () => {
      const onUnmounted = vi.fn();

      const TestComponent = defineComponent({
        unmounted: onUnmounted,
        render: () => h('div', {}, 'Test'),
      });

      const { mount } = useDynamicComponent();
      const instance = mount(TestComponent, container);

      expect(onUnmounted).not.toHaveBeenCalled();

      instance.destroy();

      expect(onUnmounted).toHaveBeenCalledTimes(1);
    });

    test('should be safe to call destroy multiple times', () => {
      const TestComponent = defineComponent({
        render: () => h('div', {}, 'Test'),
      });

      const { mount } = useDynamicComponent();
      const instance = mount(TestComponent, container);

      instance.destroy();

      expect(() => instance.destroy()).not.toThrow();
    });

    test('should cleanup multiple mounted components independently', () => {
      const container2 = document.createElement('div');
      document.body.appendChild(container2);

      const Component = defineComponent({
        props: { id: String },
        render() {
          return h('span', { class: this.id }, this.id);
        },
      });

      const { mount } = useDynamicComponent();
      const instance1 = mount(Component, container, { id: 'first' });
      const instance2 = mount(Component, container2, { id: 'second' });

      expect(container.querySelector('.first')).toBeTruthy();
      expect(container2.querySelector('.second')).toBeTruthy();

      instance1.destroy();

      expect(container.querySelector('.first')).toBeFalsy();
      expect(container2.querySelector('.second')).toBeTruthy();

      instance2.destroy();

      expect(container2.querySelector('.second')).toBeFalsy();

      container2.remove();
    });
  });

  describe('refresh', () => {
    test('should call exposed refresh method on component', () => {
      const refreshMock = vi.fn();

      const TestComponent = defineComponent({
        setup(_, { expose }) {
          expose({ refresh: refreshMock });
          return () => h('div', {}, 'Refreshable');
        },
      });

      const { mount } = useDynamicComponent();
      const instance = mount(TestComponent, container);

      instance.refresh();

      expect(refreshMock).toHaveBeenCalledTimes(1);
    });

    test('should pass arguments to exposed refresh method', () => {
      const refreshMock = vi.fn();

      const TestComponent = defineComponent({
        setup(_, { expose }) {
          expose({ refresh: refreshMock });
          return () => h('div', {}, 'Test');
        },
      });

      const { mount } = useDynamicComponent();
      const instance = mount(TestComponent, container);

      instance.refresh('arg1', 42, { key: 'value' });

      expect(refreshMock).toHaveBeenCalledWith('arg1', 42, { key: 'value' });
    });

    test('should not throw when component has no exposed refresh', () => {
      const TestComponent = defineComponent({
        render: () => h('div', {}, 'No refresh'),
      });

      const { mount } = useDynamicComponent();
      const instance = mount(TestComponent, container);

      expect(() => instance.refresh()).not.toThrow();
    });

    test('should not throw when component exposes empty object', () => {
      const TestComponent = defineComponent({
        setup(_, { expose }) {
          expose({});
          return () => h('div', {}, 'Empty expose');
        },
      });

      const { mount } = useDynamicComponent();
      const instance = mount(TestComponent, container);

      expect(() => instance.refresh()).not.toThrow();
    });

    test('should handle refresh with no arguments', () => {
      const refreshMock = vi.fn();

      const TestComponent = defineComponent({
        setup(_, { expose }) {
          expose({ refresh: refreshMock });
          return () => h('div', {}, 'Test');
        },
      });

      const { mount } = useDynamicComponent();
      const instance = mount(TestComponent, container);

      instance.refresh();

      expect(refreshMock).toHaveBeenCalledWith();
    });

    test('should call refresh multiple times', () => {
      const refreshMock = vi.fn();

      const TestComponent = defineComponent({
        setup(_, { expose }) {
          expose({ refresh: refreshMock });
          return () => h('div', {}, 'Test');
        },
      });

      const { mount } = useDynamicComponent();
      const instance = mount(TestComponent, container);

      instance.refresh('first');
      instance.refresh('second');
      instance.refresh('third');

      expect(refreshMock).toHaveBeenCalledTimes(3);
      expect(refreshMock).toHaveBeenNthCalledWith(1, 'first');
      expect(refreshMock).toHaveBeenNthCalledWith(2, 'second');
      expect(refreshMock).toHaveBeenNthCalledWith(3, 'third');
    });
  });

  describe('edge cases', () => {
    test('should work when called outside Vue component context', () => {
      const TestComponent = defineComponent({
        render: () => h('div', {}, 'Outside context'),
      });

      const { mount } = useDynamicComponent();
      const instance = mount(TestComponent, container);

      expect(container.textContent).toBe('Outside context');

      instance.destroy();
    });

    test('should mount component with complex nested structure', () => {
      const TestComponent = defineComponent({
        render: () =>
          h('div', { class: 'root' }, [
            h('header', {}, 'Header'),
            h('main', {}, [
              h('section', { class: 'content' }, 'Content'),
              h('aside', {}, 'Sidebar'),
            ]),
            h('footer', {}, 'Footer'),
          ]),
      });

      const { mount } = useDynamicComponent();
      mount(TestComponent, container);

      expect(container.querySelector('.root')).toBeTruthy();
      expect(container.querySelector('header')).toBeTruthy();
      expect(container.querySelector('.content')).toBeTruthy();
      expect(container.querySelector('aside')).toBeTruthy();
      expect(container.querySelector('footer')).toBeTruthy();
    });

    test('should handle component with setup function', () => {
      const TestComponent = defineComponent({
        props: { initialValue: Number },
        setup(props) {
          const doubled = props.initialValue! * 2;
          return () => h('span', {}, String(doubled));
        },
      });

      const { mount } = useDynamicComponent();
      mount(TestComponent, container, { initialValue: 21 });

      expect(container.textContent).toBe('42');
    });

    test('should handle component emitting events', () => {
      const eventHandler = vi.fn();

      const TestComponent = defineComponent({
        emits: ['custom-event'],
        setup(_, { emit }) {
          return () =>
            h(
              'button',
              {
                onClick: () => emit('custom-event', 'payload'),
              },
              'Click me'
            );
        },
      });

      const { mount } = useDynamicComponent();
      mount(TestComponent, container, { 'onCustom-event': eventHandler });

      const button = container.querySelector('button');
      button?.click();

      expect(eventHandler).toHaveBeenCalledWith('payload');
    });

    test('should render component with slots using default slot', () => {
      const TestComponent = defineComponent({
        render() {
          return h('div', { class: 'wrapper' }, this.$slots.default?.());
        },
      });

      const { mount } = useDynamicComponent();
      mount(TestComponent, container, {
        default: () => h('span', {}, 'Slot content'),
      });

      expect(container.querySelector('.wrapper')).toBeTruthy();
    });
  });
});
