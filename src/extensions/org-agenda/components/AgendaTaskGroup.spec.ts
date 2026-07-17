import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { expect, test, vi } from 'vitest';

import MenuGroup from 'src/components/MenuGroup.vue';
import AgendaTaskGroup from './AgendaTaskGroup.vue';
import type { AgendaTaskGroup as AgendaTaskGroupView } from '../composables/use-agenda-tasks';

vi.mock('src/boot/api', () => ({
  api: {
    ui: {
      useScreenDetection: () => ({ tabletBelow: { __v_isRef: true, value: false } }),
    },
    core: {
      useFileContent: () => ({ read: vi.fn() }),
    },
  },
}));

vi.mock('../composables/use-agenda-mini-editor', () => ({
  useAgendaMiniEditor: () => ({ openEdit: vi.fn() }),
}));

const AppSpoilerStub = defineComponent({
  name: 'AppSpoiler',
  props: {
    variant: String,
    defaultExpanded: Boolean,
  },
  template: '<section><slot name="title" /><slot name="body" /></section>',
});

const AgendaTaskRowStub = defineComponent({
  name: 'AgendaTaskRow',
  props: { task: Object },
  emits: ['edit-expand'],
  template:
    '<button class="agenda-task-row-stub" @click="$emit(\'edit-expand\')">{{ task.text }}</button>',
});

const group: AgendaTaskGroupView = {
  fileTitle: 'Inbox',
  filePath: '/inbox.org',
  tasks: [
    {
      id: 'first-task',
      kind: 'headline-todo',
      state: 'todo',
      text: 'First task',
      filePath: '/inbox.org',
      viewDate: new Date('2026-07-16'),
    },
    {
      id: 'second-task',
      kind: 'headline-todo',
      state: 'todo',
      text: 'Second task',
      filePath: '/inbox.org',
      viewDate: new Date('2026-07-16'),
    },
  ],
};

const mountTaskGroup = () =>
  mount(AgendaTaskGroup, {
    props: { group },
    global: {
      stubs: {
        AppSpoiler: AppSpoilerStub,
        AgendaTaskRow: AgendaTaskRowStub,
        AgendaTaskForm: true,
      },
    },
  });

test('AgendaTaskGroup renders tasks as a flat menu group', () => {
  const wrapper = mountTaskGroup();

  expect(wrapper.getComponent(AppSpoilerStub).props('variant')).toBe('flat');
  expect(wrapper.getComponent(MenuGroup).findAll('.agenda-task-row-stub')).toHaveLength(2);
});

test('AgendaTaskGroup combines an expanded task row and editor into one surface', async () => {
  const wrapper = mountTaskGroup();

  await wrapper.findAll('.agenda-task-row-stub')[0]?.trigger('click');

  const expandedTask = wrapper.get('.task-item.expanded');
  expect(expandedTask.get('.agenda-task-row-stub').text()).toBe('First task');
  expect(expandedTask.find('.edit-form').exists()).toBe(true);
  expect(expandedTask.find('.card-wrapper').exists()).toBe(false);
});
