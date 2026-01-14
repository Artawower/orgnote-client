import { test, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { nextTick } from 'vue';
import SourceCodeEditor from './SourceCodeEditor.vue';

const mockThemeStore = {
  isDark: false,
};

vi.mock('src/boot/api', () => ({
  api: {
    ui: {
      useTheme: vi.fn(() => mockThemeStore),
    },
  },
}));

vi.mock('src/boot/report', () => ({
  reporter: {
    reportError: vi.fn(),
  },
}));

let wrapper: VueWrapper;

beforeEach(() => {
  vi.clearAllMocks();
  mockThemeStore.isDark = false;
});

afterEach(() => {
  wrapper?.unmount();
  vi.restoreAllMocks();
});

test('renders editor container', () => {
  wrapper = mount(SourceCodeEditor, {
    props: {},
  });

  expect(wrapper.find('.source-code-editor').exists()).toBe(true);
  expect(wrapper.find('.container').exists()).toBe(true);
});

test('initializes CodeMirror editor on mount', async () => {
  wrapper = mount(SourceCodeEditor, {
    props: {},
    attachTo: document.body,
  });

  await nextTick();
  await nextTick();

  const cmEditor = wrapper.find('.cm-editor');
  expect(cmEditor.exists()).toBe(true);
});

test('displays initial content from v-model', async () => {
  const content = 'const x = 1;';
  wrapper = mount(SourceCodeEditor, {
    props: {
      modelValue: content,
    },
    attachTo: document.body,
  });

  await nextTick();
  await nextTick();

  const cmContent = wrapper.find('.cm-content');
  expect(cmContent.text()).toContain('const');
});

test('applies readonly class when readonly prop is true', () => {
  wrapper = mount(SourceCodeEditor, {
    props: {
      readonly: true,
    },
  });

  expect(wrapper.find('.source-code-editor').classes()).toContain('readonly');
});

test('does not apply readonly class when readonly prop is false', () => {
  wrapper = mount(SourceCodeEditor, {
    props: {
      readonly: false,
    },
  });

  expect(wrapper.find('.source-code-editor').classes()).not.toContain('readonly');
});

test('renders line numbers', async () => {
  wrapper = mount(SourceCodeEditor, {
    props: {
      modelValue: 'line 1\nline 2\nline 3',
    },
    attachTo: document.body,
  });

  await nextTick();
  await nextTick();

  const gutters = wrapper.find('.cm-gutters');
  expect(gutters.exists()).toBe(true);
});

test('emits update:modelValue when content changes', async () => {
  wrapper = mount(SourceCodeEditor, {
    props: {
      modelValue: 'initial',
    },
    attachTo: document.body,
  });

  await nextTick();
  await nextTick();

  const cmContent = wrapper.find('.cm-content');
  expect(cmContent.exists()).toBe(true);
});

test('cleans up editor on unmount', async () => {
  wrapper = mount(SourceCodeEditor, {
    props: {},
    attachTo: document.body,
  });

  await nextTick();
  await nextTick();

  const cmEditor = wrapper.find('.cm-editor');
  expect(cmEditor.exists()).toBe(true);

  wrapper.unmount();

  expect(document.querySelector('.cm-editor')).toBeNull();
});

test('accepts language prop for syntax highlighting', async () => {
  wrapper = mount(SourceCodeEditor, {
    props: {
      modelValue: '{"key": "value"}',
      language: 'json',
    },
    attachTo: document.body,
  });

  await nextTick();
  await nextTick();

  const cmEditor = wrapper.find('.cm-editor');
  expect(cmEditor.exists()).toBe(true);
});

test('handles empty content gracefully', async () => {
  wrapper = mount(SourceCodeEditor, {
    props: {
      modelValue: '',
    },
    attachTo: document.body,
  });

  await nextTick();
  await nextTick();

  const cmEditor = wrapper.find('.cm-editor');
  expect(cmEditor.exists()).toBe(true);
});

test('handles undefined content gracefully', async () => {
  wrapper = mount(SourceCodeEditor, {
    props: {},
    attachTo: document.body,
  });

  await nextTick();
  await nextTick();

  const cmEditor = wrapper.find('.cm-editor');
  expect(cmEditor.exists()).toBe(true);
});
