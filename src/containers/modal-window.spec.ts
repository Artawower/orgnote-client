import { test, expect, beforeEach, vi, afterEach } from 'vitest';
import { mount } from '@vue/test-utils';
import ModalWindow from './ModalWindow.vue';
import { createTestingPinia } from '@pinia/testing';
import { ref } from 'vue';
import ActionButton from 'src/components/ActionButton.vue';
import { nextTick } from 'vue';

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modals: ref<any[]>([]),
  config: ref({}),
  close: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  mockModal.modals.value = [];
  mockModal.close.mockClear();
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

afterEach(() => {
  vi.restoreAllMocks();
});

test('renders no dialogs when modals is empty', async () => {
  const dialogs = wrapper.findAll('dialog');
  expect(dialogs.length).toBe(0);
});

test('renders a single dialog when modals has 1 item', async () => {
  mockModal.modals.value.push({
    component: { template: '<div>ModalOne</div>' },
    config: { title: 'Modal One', closable: true },
  });
  await wrapper.vm.$nextTick();
  const dialogs = wrapper.findAll('dialog');
  expect(dialogs.length).toBe(1);
});

test('renders multiple dialogs when multiple items in modals', async () => {
  mockModal.modals.value.push(
    { component: { template: '<div>ModalOne</div>' }, config: {} },
    { component: { template: '<div>ModalTwo</div>' }, config: {} },
  );
  await wrapper.vm.$nextTick();
  const dialogs = wrapper.findAll('dialog');
  expect(dialogs.length).toBe(2);
});

test('newly added modal calls showModal()', async () => {
  mockModal.modals.value = [
    ...mockModal.modals.value,
    {
      component: { template: '<div>ModalOne</div>' },
      config: { title: 'Modal One' },
    },
  ];

  const showModalSpy = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
  await wrapper.vm.$nextTick();
  await wrapper.vm.$nextTick();

  expect(showModalSpy).toHaveBeenCalled();

  showModalSpy.mockRestore();
});

test('renders component in topmost modal', async () => {
  const TestComponent = { template: '<div>Test Component</div>' };
  mockModal.modals.value = [{ component: TestComponent, config: {} }];
  await wrapper.vm.$nextTick();
  expect(wrapper.findComponent(TestComponent).exists()).toBe(true);
});

test('renders title from config.title', async () => {
  mockModal.modals.value = [
    { component: { template: '<div>First</div>' }, config: { title: 'First Title' } },
    { component: { template: '<div>Second</div>' }, config: { title: 'Second Title' } },
  ];
  await wrapper.vm.$nextTick();
  const allTitles = wrapper.findAll('h1.title');
  expect(allTitles.length).toBe(2);
  expect(allTitles.at(0)?.text()).toBe('First Title');
  expect(allTitles.at(1)?.text()).toBe('Second Title');
});

test('renders close button when config.closable is true', async () => {
  mockModal.modals.value = [
    { component: { template: '<div>SomeModal</div>' }, config: { closable: true, title: 'p' } },
  ];
  await wrapper.vm.$nextTick();
  await nextTick();
  const closeButton = wrapper.findComponent(ActionButton);
  expect(closeButton.exists()).toBe(true);
});

test('does not render close button when config.closable is false', async () => {
  mockModal.modals.value = [
    { component: { template: '<div>ModalNoClose</div>' }, config: { closable: false } },
  ];
  await wrapper.vm.$nextTick();
  const closeButton = wrapper.find('action-button-stub');
  expect(closeButton.exists()).toBe(false);
});

// TODO: feat/stable-beta fix it
test.skip('closes the topmost modal when clicking outside modal content', async () => {
  mockModal.modals.value = [
    { component: { template: '<div>ModalOutsideClick</div>' }, config: {} },
  ];
  await wrapper.vm.$nextTick();
  const dialog = wrapper.find('dialog');
  await dialog.trigger('click');
  expect(mockModal.close).toHaveBeenCalledTimes(1);
});

test('does not close modal when clicking inside modal content', async () => {
  mockModal.modals.value = [{ component: { template: '<div>SomeModal</div>' }, config: {} }];
  await wrapper.vm.$nextTick();
  const modalContent = wrapper.find('.modal-content');
  await modalContent.trigger('click');
  expect(mockModal.close).not.toHaveBeenCalled();
});

test('removing a modal from modals closes/removes that dialog', async () => {
  mockModal.modals.value = [
    { component: { template: '<div>First Modal</div>' }, config: {} },
    { component: { template: '<div>Second Modal</div>' }, config: {} },
  ];
  await wrapper.vm.$nextTick();
  let dialogs = wrapper.findAll('dialog');
  expect(dialogs.length).toBe(2);
  mockModal.modals.value.pop();
  await wrapper.vm.$nextTick();
  dialogs = wrapper.findAll('dialog');
  expect(dialogs.length).toBe(1);
});
