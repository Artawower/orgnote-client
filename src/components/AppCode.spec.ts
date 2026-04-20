import { mount } from '@vue/test-utils';
import { test, expect } from 'vitest';
import { defineComponent, h } from 'vue';
import AppCode from './AppCode.vue';

const HighlightjsStub = defineComponent({
  name: 'Highlightjs',
  props: ['code', 'autodetect'],
  render() {
    return h('pre', {}, [h('code', {}, this.code ?? '')]);
  },
});

const mountAppCode = (props: { code?: string }) =>
  mount(AppCode, {
    props: props as any,
    global: {
      components: {
        highlightjs: HighlightjsStub,
      },
    },
  });

test('AppCode renders highlighted code when code prop is provided', () => {
  const code = '<div>hello</div>';
  const wrapper = mountAppCode({ code });

  expect(wrapper.text()).toContain('hello');
  expect(wrapper.find('pre').exists()).toBe(true);
  expect(wrapper.find('code').exists()).toBe(true);
});

test('AppCode handles empty string code prop', () => {
  const wrapper = mountAppCode({ code: '' });

  expect(wrapper.find('pre').exists()).toBe(true);
  expect(wrapper.find('code').exists()).toBe(true);
});

test('AppCode handles undefined code prop without crashing', () => {
  const wrapper = mountAppCode({ code: undefined });

  expect(wrapper.find('pre').exists()).toBe(true);
  expect(wrapper.find('code').exists()).toBe(true);
});
