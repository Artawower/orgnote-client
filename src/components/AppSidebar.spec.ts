import { mount } from '@vue/test-utils';
import AppSidebar from './AppSidebar.vue';
import { describe, test, expect } from 'vitest';

describe('AppSidebar', () => {
  test('renders default slot content', () => {
    const wrapper = mount(AppSidebar, {
      slots: {
        default: '<div class="test-content">Sidebar content</div>',
      },
    });

    expect(wrapper.find('.test-content').text()).toBe('Sidebar content');
  });

  test('has sidebar class', () => {
    const wrapper = mount(AppSidebar);

    expect(wrapper.classes()).toContain('sidebar');
  });

  test('applies opened class when opened prop is true', () => {
    const wrapper = mount(AppSidebar, {
      props: { opened: true },
    });

    expect(wrapper.classes()).toContain('opened');
  });

  test('does not apply opened class when opened prop is false', () => {
    const wrapper = mount(AppSidebar, {
      props: { opened: false },
    });

    expect(wrapper.classes()).not.toContain('opened');
  });

  test('is opened by default', () => {
    const wrapper = mount(AppSidebar);

    expect(wrapper.classes()).toContain('opened');
  });

  test('renders mini section when mini prop is true', () => {
    const wrapper = mount(AppSidebar, {
      props: { mini: true },
      slots: {
        'mini-top': '<div class="mini-top-content">Top</div>',
        'mini-footer': '<div class="mini-footer-content">Footer</div>',
      },
    });

    expect(wrapper.find('.mini').exists()).toBe(true);
    expect(wrapper.find('.mini-top-content').text()).toBe('Top');
    expect(wrapper.find('.mini-footer-content').text()).toBe('Footer');
  });

  test('does not render mini section when mini prop is false', () => {
    const wrapper = mount(AppSidebar, {
      props: { mini: false },
    });

    expect(wrapper.find('.mini').exists()).toBe(false);
  });

  test('applies has-mini class when mini prop is true', () => {
    const wrapper = mount(AppSidebar, {
      props: { mini: true },
    });

    expect(wrapper.classes()).toContain('has-mini');
  });

  test('wraps content in SafeArea with top inset', () => {
    const wrapper = mount(AppSidebar);
    const safeArea = wrapper.findComponent({ name: 'SafeArea' });

    expect(safeArea.exists()).toBe(true);
    expect(safeArea.props('top')).toBe(true);
  });
});
