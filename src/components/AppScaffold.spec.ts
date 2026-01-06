import { mount } from '@vue/test-utils';
import AppScaffold from './AppScaffold.vue';
import { test, expect } from 'vitest';

test('AppScaffold renders default slot content', () => {
  const wrapper = mount(AppScaffold, {
    slots: {
      default: '<div class="main-content">Main Content</div>',
    },
  });

  expect(wrapper.find('.main-content').text()).toBe('Main Content');
});

test('AppScaffold has scaffold base class', () => {
  const wrapper = mount(AppScaffold);

  expect(wrapper.classes()).toContain('scaffold');
});

test('AppScaffold renders header slot when provided', () => {
  const wrapper = mount(AppScaffold, {
    slots: {
      header: '<nav class="header">Header</nav>',
    },
  });

  expect(wrapper.find('.header').exists()).toBe(true);
  expect(wrapper.find('.panel.top').exists()).toBe(true);
});

test('AppScaffold renders footer slot when provided', () => {
  const wrapper = mount(AppScaffold, {
    slots: {
      footer: '<footer class="footer">Footer</footer>',
    },
  });

  expect(wrapper.find('.footer').exists()).toBe(true);
  expect(wrapper.find('.panel.bottom').exists()).toBe(true);
});

test('AppScaffold does not render header panel when slot is empty', () => {
  const wrapper = mount(AppScaffold);

  expect(wrapper.find('.panel.top').exists()).toBe(false);
});

test('AppScaffold does not render footer panel when slot is empty', () => {
  const wrapper = mount(AppScaffold);

  expect(wrapper.find('.panel.bottom').exists()).toBe(false);
});

test('AppScaffold scaffold has has-header class when header slot provided', () => {
  const wrapper = mount(AppScaffold, {
    slots: {
      header: '<nav>Header</nav>',
    },
  });

  expect(wrapper.classes()).toContain('has-header');
});

test('AppScaffold scaffold has has-footer class when footer slot provided', () => {
  const wrapper = mount(AppScaffold, {
    slots: {
      footer: '<footer>Footer</footer>',
    },
  });

  expect(wrapper.classes()).toContain('has-footer');
});

test('AppScaffold scaffold has no modifier classes when no header or footer', () => {
  const wrapper = mount(AppScaffold, {
    slots: {
      default: '<div>Content</div>',
    },
  });

  expect(wrapper.classes()).not.toContain('has-header');
  expect(wrapper.classes()).not.toContain('has-footer');
});

test('AppScaffold scaffold has both modifier classes when header and footer provided', () => {
  const wrapper = mount(AppScaffold, {
    slots: {
      header: '<nav>Header</nav>',
      default: '<main>Content</main>',
      footer: '<footer>Footer</footer>',
    },
  });

  expect(wrapper.classes()).toContain('has-header');
  expect(wrapper.classes()).toContain('has-footer');
});

test('AppScaffold renders all three slots together', () => {
  const wrapper = mount(AppScaffold, {
    slots: {
      header: '<nav class="test-header">Header</nav>',
      default: '<main class="test-main">Main</main>',
      footer: '<footer class="test-footer">Footer</footer>',
    },
  });

  expect(wrapper.find('.test-header').text()).toBe('Header');
  expect(wrapper.find('.test-main').text()).toBe('Main');
  expect(wrapper.find('.test-footer').text()).toBe('Footer');
});
