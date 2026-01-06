import { mount } from '@vue/test-utils';
import PageWrapper from './PageWrapper.vue';
import { test, expect } from 'vitest';

test('PageWrapper should render slot content', () => {
  const wrapper = mount(PageWrapper, {
    slots: {
      default: '<div class="test-content">Page content</div>',
    },
  });

  expect(wrapper.find('.test-content').exists()).toBe(true);
  expect(wrapper.find('.test-content').text()).toBe('Page content');
});

test('PageWrapper should apply padding class when padding prop is true', () => {
  const wrapper = mount(PageWrapper, {
    props: {
      padding: true,
    },
    slots: {
      default: '<div>Content</div>',
    },
  });

  expect(wrapper.find('.page').classes()).toContain('padding');
});

test('PageWrapper should not apply padding class when padding prop is false', () => {
  const wrapper = mount(PageWrapper, {
    props: {
      padding: false,
    },
    slots: {
      default: '<div>Content</div>',
    },
  });

  expect(wrapper.find('.page').classes()).not.toContain('padding');
});

test('PageWrapper should not apply padding class by default', () => {
  const wrapper = mount(PageWrapper, {
    slots: {
      default: '<div>Content</div>',
    },
  });

  expect(wrapper.find('.page').classes()).not.toContain('padding');
});

test('PageWrapper should apply constrained class when constrained prop is true', () => {
  const wrapper = mount(PageWrapper, {
    props: {
      constrained: true,
    },
    slots: {
      default: '<div>Content</div>',
    },
  });

  expect(wrapper.find('.page').classes()).toContain('constrained');
});

test('PageWrapper should not apply constrained class when constrained prop is false', () => {
  const wrapper = mount(PageWrapper, {
    props: {
      constrained: false,
    },
    slots: {
      default: '<div>Content</div>',
    },
  });

  expect(wrapper.find('.page').classes()).not.toContain('constrained');
});

test('PageWrapper should not apply constrained class by default', () => {
  const wrapper = mount(PageWrapper, {
    slots: {
      default: '<div>Content</div>',
    },
  });

  expect(wrapper.find('.page').classes()).not.toContain('constrained');
});

test('PageWrapper should apply both padding and constrained classes when both props are true', () => {
  const wrapper = mount(PageWrapper, {
    props: {
      padding: true,
      constrained: true,
    },
    slots: {
      default: '<div>Content</div>',
    },
  });

  const pageClasses = wrapper.find('.page').classes();
  expect(pageClasses).toContain('padding');
  expect(pageClasses).toContain('constrained');
});

test('PageWrapper should apply only padding when constrained is false', () => {
  const wrapper = mount(PageWrapper, {
    props: {
      padding: true,
      constrained: false,
    },
    slots: {
      default: '<div>Content</div>',
    },
  });

  const pageClasses = wrapper.find('.page').classes();
  expect(pageClasses).toContain('padding');
  expect(pageClasses).not.toContain('constrained');
});

test('PageWrapper should apply only constrained when padding is false', () => {
  const wrapper = mount(PageWrapper, {
    props: {
      padding: false,
      constrained: true,
    },
    slots: {
      default: '<div>Content</div>',
    },
  });

  const pageClasses = wrapper.find('.page').classes();
  expect(pageClasses).not.toContain('padding');
  expect(pageClasses).toContain('constrained');
});

test('PageWrapper should render with no classes when no props provided', () => {
  const wrapper = mount(PageWrapper, {
    slots: {
      default: '<div>Content</div>',
    },
  });

  const pageClasses = wrapper.find('.page').classes();
  expect(pageClasses).toContain('page');
  expect(pageClasses).toContain('flex-container');
  expect(pageClasses).not.toContain('padding');
  expect(pageClasses).not.toContain('constrained');
});

test('PageWrapper should handle empty slot content', () => {
  const wrapper = mount(PageWrapper, {
    slots: {
      default: '',
    },
  });

  expect(wrapper.find('.page').exists()).toBe(true);
  expect(wrapper.find('.page').text()).toBe('');
});

test('PageWrapper should handle multiple child elements in slot', () => {
  const wrapper = mount(PageWrapper, {
    slots: {
      default: `
        <div class="child1">Child 1</div>
        <div class="child2">Child 2</div>
        <div class="child3">Child 3</div>
      `,
    },
  });

  expect(wrapper.find('.child1').exists()).toBe(true);
  expect(wrapper.find('.child2').exists()).toBe(true);
  expect(wrapper.find('.child3').exists()).toBe(true);
});

test('PageWrapper should maintain page class regardless of props', () => {
  const wrappers = [
    mount(PageWrapper, { props: { padding: true } }),
    mount(PageWrapper, { props: { constrained: true } }),
    mount(PageWrapper, { props: { padding: true, constrained: true } }),
    mount(PageWrapper),
  ];

  wrappers.forEach((wrapper) => {
    expect(wrapper.find('.page').exists()).toBe(true);
  });
});

test('PageWrapper should update classes when props change', async () => {
  const wrapper = mount(PageWrapper, {
    props: {
      padding: false,
      constrained: false,
    },
    slots: {
      default: '<div>Content</div>',
    },
  });

  expect(wrapper.find('.page').classes()).not.toContain('padding');
  expect(wrapper.find('.page').classes()).not.toContain('constrained');

  await wrapper.setProps({ padding: true });
  expect(wrapper.find('.page').classes()).toContain('padding');

  await wrapper.setProps({ constrained: true });
  expect(wrapper.find('.page').classes()).toContain('constrained');

  await wrapper.setProps({ padding: false, constrained: false });
  expect(wrapper.find('.page').classes()).not.toContain('padding');
  expect(wrapper.find('.page').classes()).not.toContain('constrained');
});

test('PageWrapper should handle boolean prop edge cases', async () => {
  const wrapper = mount(PageWrapper, {
    props: {
      padding: undefined,
      constrained: undefined,
    },
    slots: {
      default: '<div>Content</div>',
    },
  });

  expect(wrapper.find('.page').classes()).not.toContain('padding');
  expect(wrapper.find('.page').classes()).not.toContain('constrained');
});
