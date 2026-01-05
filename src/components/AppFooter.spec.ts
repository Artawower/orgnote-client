import { mount } from '@vue/test-utils';
import AppFooter from './AppFooter.vue';
import { describe, test, expect } from 'vitest';

describe('AppFooter', () => {
  test('renders slot content', () => {
    const wrapper = mount(AppFooter, {
      slots: {
        default: '<button>Action</button>',
      },
    });

    expect(wrapper.find('button').text()).toBe('Action');
  });

  test('has footer-wrapper class on root and footer class inside', () => {
    const wrapper = mount(AppFooter);

    expect(wrapper.classes()).toContain('footer-wrapper');
    expect(wrapper.find('.footer').exists()).toBe(true);
  });

  test('uses center justify by default', () => {
    const wrapper = mount(AppFooter);
    const flex = wrapper.findComponent({ name: 'AppFlex' });

    expect(flex.props('justify')).toBe('center');
  });

  test('accepts custom justify prop', () => {
    const wrapper = mount(AppFooter, {
      props: { justify: 'between' },
    });
    const flex = wrapper.findComponent({ name: 'AppFlex' });

    expect(flex.props('justify')).toBe('between');
  });
});
