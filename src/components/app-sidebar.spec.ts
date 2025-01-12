import { test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import AppSidebar from './AppSidebar.vue';
import { nextTick } from 'vue';

test('renders slots correctly', () => {
  const wrapper = mount(AppSidebar, {
    props: {
      opened: true,
      mini: true,
    },
    slots: {
      default: '<div>Default Content</div>',
      'mini-footer': '<div>Footer Content</div>',
      'mini-top': '<h1>TOP</h1>',
    },
  });

  expect(wrapper.text()).toContain('Default Content');
  expect(wrapper.text()).toContain('Footer Content');
});

test('applies "mini" class when the mini prop is true', () => {
  const wrapper = mount(AppSidebar, {
    props: { mini: true },
  });

  expect(wrapper.find('.mini').exists()).toBe(true);
});

test('does not render "mini" when mini prop is false', () => {
  const wrapper = mount(AppSidebar, {
    props: { mini: false },
  });

  expect(wrapper.find('.mini').exists()).toBe(false);
});

test('applies the correct class based on "opened" prop', () => {
  const wrapper = mount(AppSidebar, {
    props: { opened: true },
  });

  expect(wrapper.classes()).toContain('opened');
});

test('does not apply "opened" class when prop is false', () => {
  const wrapper = mount(AppSidebar, {
    props: { opened: false },
  });

  expect(wrapper.classes()).not.toContain('opened');
});

test('renders content section when "opened" is true', () => {
  const wrapper = mount(AppSidebar, {
    props: { opened: true },
  });

  expect(wrapper.find('.content').exists()).toBe(true);
});

test('adds or removes "opened" class based on prop', async () => {
  const wrapper = mount(AppSidebar, {
    props: { opened: true },
  });

  expect(wrapper.classes()).toContain('opened');

  await wrapper.setProps({ opened: false });
  await nextTick();

  expect(wrapper.classes()).not.toContain('opened');
});

// TODO: Styles does not applied for some reason, prbably it's correspond to happy-dom
test.skip('content section is hidden when "opened" is false', async () => {
  const wrapper = mount(AppSidebar, {
    props: { opened: false },
  });

  await nextTick();
  expect(wrapper.find('.content').exists()).toBe(true);
  const content = wrapper.find('.content').element;
  const computedStyle = getComputedStyle(content);

  expect(computedStyle.width).toBe('0px');
});

test('does not render slots when mini is false', () => {
  const wrapper = mount(AppSidebar, {
    props: {
      opened: true,
      mini: false,
    },
    slots: {
      default: '<div>Default Content</div>',
      'mini-footer': '<div>Footer Content</div>',
      'mini-top': '<h1>TOP</h1>',
    },
  });

  expect(wrapper.text()).toContain('Default Content');
  expect(wrapper.text()).not.toContain('Footer Content');
  expect(wrapper.text()).not.toContain('TOP');
});
