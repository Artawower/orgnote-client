import { test, expect, beforeEach, vi, afterEach } from 'vitest';
import type * as VueI18n from 'vue-i18n';
import { mount } from '@vue/test-utils';
import ModalContainer from './ModalContainer.vue';
import { createTestingPinia } from '@pinia/testing';
import { ref, markRaw } from 'vue';
import ActionButton from 'src/components/ActionButton.vue';
import { nextTick } from 'vue';
import type { Modal } from 'orgnote-api';

vi.mock('src/boot/api', () => ({
  api: {
    ui: {
      useModal: vi.fn(() => mockModal),
    },
    core: {
      useNotifications: vi.fn(() => ({
        notifications: ref([]),
      })),
    },
  },
}));

vi.mock('vue-i18n', async () => {
  const actual = (await vi.importActual('vue-i18n')) as typeof VueI18n;

  return {
    ...actual,
    useI18n: vi.fn(() => ({
      t: vi.fn((key) => key),
    })),
  };
});

let wrapper: ReturnType<typeof mount>;
let nextId = 0;
const mockModal = {
  modals: ref<Modal[]>([]),
  config: ref({}),
  close: vi.fn(),
};

beforeEach(() => {
  vi.clearAllMocks();
  nextId = 0;
  mockModal.modals.value = [];
  mockModal.close.mockClear();
  wrapper = mount(ModalContainer, {
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
  wrapper.unmount();
  vi.restoreAllMocks();
});

test('renders no dialogs when modals is empty', async () => {
  const dialogs = wrapper.findAll('dialog');
  expect(dialogs.length).toBe(0);
});

test('modal-wide class applied when config.wide enabled', async () => {
  mockModal.modals.value = [
    {
      id: ++nextId,
      component: markRaw({ template: '<div>WideModal</div>' }),
      config: { wide: true },
    },
  ];
  await wrapper.vm.$nextTick();

  const dialog = wrapper.find('dialog');
  expect(dialog.classes()).toContain('modal-wide');
});

test('modal-wide class absent when config.wide disabled', async () => {
  mockModal.modals.value = [
    {
      id: ++nextId,
      component: markRaw({ template: '<div>NormalModal</div>' }),
      config: { wide: false },
    },
  ];
  await wrapper.vm.$nextTick();

  const dialog = wrapper.find('dialog');
  expect(dialog.classes()).not.toContain('modal-wide');
});

test('renders a single dialog when modals has 1 item', async () => {
  mockModal.modals.value.push({
    id: ++nextId,
    component: markRaw({ template: '<div>ModalOne</div>' }),
    config: { title: 'Modal One', closable: true },
  });
  await wrapper.vm.$nextTick();
  const dialogs = wrapper.findAll('dialog');
  expect(dialogs.length).toBe(1);
});

test('renders multiple dialogs when multiple items in modals', async () => {
  mockModal.modals.value.push(
    { id: ++nextId, component: markRaw({ template: '<div>ModalOne</div>' }), config: {} },
    { id: ++nextId, component: markRaw({ template: '<div>ModalTwo</div>' }), config: {} },
  );
  await wrapper.vm.$nextTick();
  const dialogs = wrapper.findAll('dialog');
  expect(dialogs.length).toBe(2);
});

test('newly added modal calls showModal()', async () => {
  mockModal.modals.value = [
    ...mockModal.modals.value,
    {
      id: ++nextId,
      component: markRaw({ template: '<div>ModalOne</div>' }),
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
  const TestComponent = markRaw({ template: '<div>Test Component</div>' });
  mockModal.modals.value = [{ id: ++nextId, component: TestComponent, config: {} }];
  await wrapper.vm.$nextTick();
  expect(wrapper.findComponent(TestComponent).exists()).toBe(true);
});

test('renders title from config.title', async () => {
  mockModal.modals.value = [
    { id: ++nextId, component: markRaw({ template: '<div>First</div>' }), config: { title: 'First Title' } },
    { id: ++nextId, component: markRaw({ template: '<div>Second</div>' }), config: { title: 'Second Title' } },
  ];
  await wrapper.vm.$nextTick();
  const allTitles = wrapper.findAll('h1.title');
  expect(allTitles.length).toBe(2);
  expect(allTitles.at(0)?.text()).toBe('First Title');
  expect(allTitles.at(1)?.text()).toBe('Second Title');
});

test('renders close button when config.closable is true', async () => {
  mockModal.modals.value = [
    {
      id: ++nextId,
      component: markRaw({ template: '<div>SomeModal</div>' }),
      config: { closable: true, title: 'p' },
    },
  ];
  await wrapper.vm.$nextTick();
  await nextTick();
  const closeButton = wrapper.findComponent(ActionButton);
  expect(closeButton.exists()).toBe(true);
});

test('does not render close button when config.closable is false', async () => {
  mockModal.modals.value = [
    { id: ++nextId, component: markRaw({ template: '<div>ModalNoClose</div>' }), config: { closable: false } },
  ];
  await wrapper.vm.$nextTick();
  const closeButton = wrapper.find('action-button-stub');
  expect(closeButton.exists()).toBe(false);
});

// TODO: feat/stable-beta fix it
test.skip('closes the topmost modal when clicking outside modal content', async () => {
  mockModal.modals.value = [
    { id: ++nextId, component: markRaw({ template: '<div>ModalOutsideClick</div>' }), config: {} },
  ];
  await wrapper.vm.$nextTick();
  const dialog = wrapper.find('dialog');
  await dialog.trigger('click');
  expect(mockModal.close).toHaveBeenCalledTimes(1);
});

test('does not close modal when clicking inside modal content', async () => {
  mockModal.modals.value = [
    { id: ++nextId, component: markRaw({ template: '<div>SomeModal</div>' }), config: {} },
  ];
  await wrapper.vm.$nextTick();
  const modalContent = wrapper.find('.modal-content');
  await modalContent.trigger('click');
  expect(mockModal.close).not.toHaveBeenCalled();
});

test('removing a modal from modals closes/removes that dialog', async () => {
  mockModal.modals.value = [
    { id: ++nextId, component: markRaw({ template: '<div>First Modal</div>' }), config: {} },
    { id: ++nextId, component: markRaw({ template: '<div>Second Modal</div>' }), config: {} },
  ];
  await wrapper.vm.$nextTick();
  let dialogs = wrapper.findAll('dialog');
  expect(dialogs.length).toBe(2);
  mockModal.modals.value.pop();
  await wrapper.vm.$nextTick();
  dialogs = wrapper.findAll('dialog');
  expect(dialogs.length).toBe(1);
});

test('ModalContainer removing modal calls native dialog close before unmount', async () => {
  const showModalSpy = vi
    .spyOn(HTMLDialogElement.prototype, 'showModal')
    .mockImplementation(vi.fn());
  const closeSpy = vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(vi.fn());

  mockModal.modals.value = [
    {
      id: ++nextId,
      component: markRaw({ template: '<div>ModalForClose</div>' }),
      config: {},
    },
  ];

  await nextTick();
  await nextTick();

  expect(showModalSpy).toHaveBeenCalled();

  const dialogElement = wrapper.find('dialog').element as HTMLDialogElement;
  Object.defineProperty(dialogElement, 'open', {
    value: true,
    writable: true,
    configurable: true,
  });

  mockModal.modals.value = [];
  await nextTick();

  expect(closeSpy).toHaveBeenCalled();
});

test('ModalContainer swap replacing modal calls showModal on new dialog', async () => {
  const showModalSpy = vi
    .spyOn(HTMLDialogElement.prototype, 'showModal')
    .mockImplementation(vi.fn());
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(vi.fn());

  const componentA = markRaw({ template: '<div>ComponentA</div>' });
  const componentB = markRaw({ template: '<div>ComponentB</div>' });

  mockModal.modals.value = [{ id: ++nextId, component: componentA, config: {} }];
  await nextTick();
  await nextTick();

  expect(showModalSpy).toHaveBeenCalledTimes(1);

  mockModal.modals.value = [{ id: ++nextId, component: componentB, config: {} }];
  await nextTick();
  await nextTick();

  expect(showModalSpy).toHaveBeenCalledTimes(2);
});

test('ModalContainer swap closes old dialog before opening new one', async () => {
  const callOrder: string[] = [];

  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(function () {
    callOrder.push('showModal');
  });
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(function () {
    callOrder.push('close');
  });

  const componentA = markRaw({ template: '<div>ComponentA</div>' });
  const componentB = markRaw({ template: '<div>ComponentB</div>' });

  mockModal.modals.value = [{ id: ++nextId, component: componentA, config: {} }];
  await nextTick();
  await nextTick();

  const dialogElement = wrapper.find('dialog').element as HTMLDialogElement;
  Object.defineProperty(dialogElement, 'open', {
    value: true,
    writable: true,
    configurable: true,
  });

  callOrder.length = 0;

  mockModal.modals.value = [{ id: ++nextId, component: componentB, config: {} }];
  await nextTick();
  await nextTick();

  expect(callOrder[0]).toBe('close');
  expect(callOrder[1]).toBe('showModal');
});

test('ModalContainer swap renders new component after modal replacement', async () => {
  vi.spyOn(HTMLDialogElement.prototype, 'showModal').mockImplementation(vi.fn());
  vi.spyOn(HTMLDialogElement.prototype, 'close').mockImplementation(vi.fn());

  const componentA = markRaw({ template: '<div class="comp-a">ComponentA</div>' });
  const componentB = markRaw({ template: '<div class="comp-b">ComponentB</div>' });

  mockModal.modals.value = [{ id: ++nextId, component: componentA, config: {} }];
  await nextTick();
  await nextTick();

  expect(wrapper.find('.comp-a').exists()).toBe(true);

  mockModal.modals.value = [{ id: ++nextId, component: componentB, config: {} }];
  await nextTick();
  await nextTick();

  expect(wrapper.find('.comp-b').exists()).toBe(true);
  expect(wrapper.find('.comp-a').exists()).toBe(false);
});
