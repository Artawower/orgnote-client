import { mount } from '@vue/test-utils';
import { defineComponent, h, ref } from 'vue';
import { beforeEach, expect, test, vi } from 'vitest';
import type * as VueI18n from 'vue-i18n';

vi.mock('vue-i18n', async () => ({
  ...((await vi.importActual('vue-i18n')) as typeof VueI18n),
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('src/boot/api', () => ({
  api: {
    core: {
      useCompletion: () => ({ open: vi.fn() }),
    },
    ui: {
      useScreenDetection: () => ({ tabletBelow: ref(false) }),
    },
  },
}));

vi.mock('../composables/use-agenda-mini-editor', () => ({
  useAgendaMiniEditor: () => ({ openCreate: vi.fn() }),
}));

const AgendaTaskFormStub = defineComponent({
  name: 'AgendaTaskForm',
  props: ['title'],
  emits: ['update:title', 'submit'],
  setup: (_, { slots, expose }) => {
    expose({ focusTitle: vi.fn(), focusBody: vi.fn(), blurTitle: vi.fn() });
    return () => h('div', [slots['title-actions']?.(), slots['toolbar-start']?.()]);
  },
});

const AgendaScheduleButtonStub = defineComponent({
  name: 'AgendaScheduleButton',
  setup: () => () => h('button'),
});

const mountQuickAdd = async (habitMode = false) => {
  const { default: AgendaQuickAdd } = await import('./AgendaQuickAdd.vue');
  return mount(AgendaQuickAdd, {
    props: {
      agendaFilesPath: '/agenda',
      inboxFilePath: '/agenda/inbox.org',
      defaultDate: '2026-06-10',
      habitMode,
    },
    global: {
      stubs: {
        CardWrapper: { template: '<div><slot /></div>' },
        AgendaTaskForm: AgendaTaskFormStub,
        AgendaScheduleButton: AgendaScheduleButtonStub,
        AppBadge: true,
        ActionButton: true,
      },
    },
  });
};

beforeEach(() => {
  vi.clearAllMocks();
});

test('AgendaQuickAdd inherits the filter date without rendering a task date picker', async () => {
  const wrapper = await mountQuickAdd();
  const form = wrapper.findComponent(AgendaTaskFormStub);

  await form.vm.$emit('update:title', 'Plan release');
  await form.vm.$emit('submit');

  expect(wrapper.findComponent(AgendaScheduleButtonStub).exists()).toBe(false);
  expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual(
    expect.objectContaining({
      title: 'Plan release',
      scheduled: { date: '2026-06-10' },
    }),
  );
});

test('AgendaQuickAdd keeps schedule controls for habit creation', async () => {
  const wrapper = await mountQuickAdd(true);

  expect(wrapper.findComponent(AgendaScheduleButtonStub).exists()).toBe(true);
});
