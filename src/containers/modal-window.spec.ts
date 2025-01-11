import { test, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ModalWindow from './ModalWindow.vue';
import { createTestingPinia } from '@pinia/testing';
import { ref } from 'vue';
import ActionButton from 'src/components/ActionButton.vue';
import { shallowRef } from 'vue';

vi.mock('src/boot/api', () => ({
  api: {
    ui: {
      useModal: vi.fn(() => mockModal),
    },
  },
}));

vi.mock('vue-i18n', () => ({
  useI18n: vi.fn(() => ({
    t: vi.fn((key) => key),
  })),
}));

let wrapper: ReturnType<typeof mount>;
const mockModal = {
  opened: ref(false),
  component: shallowRef(null),
  config: ref({}),
  close: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();

  wrapper = mount(ModalWindow, {
    global: {
      plugins: [
        createTestingPinia({
          createSpy: vi.fn,
        }),
      ],
    },
  });
});

test('renders dialog element', () => {
  expect(wrapper.find('dialog').exists()).toBe(true);
});

test('dialog opens when `opened` is true', async () => {
  mockModal.opened.value = true;
  await wrapper.vm.$nextTick();

  const dialog = wrapper.find('dialog');
  expect(dialog.element.open).toBe(true);
});

test('dialog closes when `opened` is false', async () => {
  mockModal.opened.value = false;
  await wrapper.vm.$nextTick();

  const dialog = wrapper.find('dialog');
  expect(dialog.element.open).toBe(false);
});

test('renders component dynamically when provided', async () => {
  const TestComponent = { template: '<div>Test Component</div>' };
  mockModal.component.value = TestComponent;
  await wrapper.vm.$nextTick();

  expect(wrapper.findComponent(TestComponent).exists()).toBe(true);
});

test('renders title when `config.title` is set', async () => {
  mockModal.config.value = { title: 'Test Title', closable: true };
  await wrapper.vm.$nextTick();

  const title = wrapper.find('h1.title');
  expect(title.exists()).toBe(true);
  expect(title.text()).toBe('Test Title');
});

test('renders close button when `config.closable` is true', async () => {
  mockModal.config.value = { closable: true };
  await wrapper.vm.$nextTick();

  const closeButton = wrapper.findComponent(ActionButton);
  expect(closeButton.exists()).toBe(true);
});

test('does not render close button when `config.closable` is false', async () => {
  mockModal.config.value = { closable: false };
  await wrapper.vm.$nextTick();

  const closeButton = wrapper.findComponent({ name: 'action-button' });
  expect(closeButton.exists()).toBe(false);
});

test('closes modal when clicking outside modal content', async () => {
  mockModal.opened.value = true;
  await wrapper.vm.$nextTick();
  const dialog = wrapper.find('dialog');
  await dialog.trigger('click');
  expect(mockModal.close).toHaveBeenCalled();
});

test('does not close modal when clicking inside modal content', async () => {
  const modalContent = wrapper.find('div.modal-content');
  await modalContent.trigger('click');

  expect(mockModal.close).not.toHaveBeenCalled();
});
