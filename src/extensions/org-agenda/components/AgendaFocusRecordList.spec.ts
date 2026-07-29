import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { expect, test } from 'vitest';
import MenuGroup from 'src/components/MenuGroup.vue';
import AgendaFocusRecordList from './AgendaFocusRecordList.vue';
import type { AgendaFocusRecordGroup } from './agenda-focus-record-types';

const AppSpoilerStub = defineComponent({
  name: 'AppSpoiler',
  props: { variant: String, defaultExpanded: Boolean },
  template: '<section><slot name="title" /><slot name="actions" /><slot name="body" /></section>',
});

const MenuItemStub = defineComponent({
  name: 'MenuItem',
  emits: ['click'],
  template:
    '<button class="record-stub" @click="$emit(\'click\')"><slot /><slot name="right" /></button>',
});

const AppTitleStub = defineComponent({
  name: 'AppTitle',
  template: '<h5><slot /></h5>',
});

const AppBadgeStub = defineComponent({
  name: 'AppBadge',
  props: { label: String },
  template: '<span class="badge-stub">{{ label }}</span>',
});

const EmptyStateStub = defineComponent({
  name: 'EmptyState',
  props: { title: String },
  template: '<div class="empty-state-stub">{{ title }}</div>',
});

const groups: readonly AgendaFocusRecordGroup[] = [
  {
    filePath: '/notes/project.org',
    fileTitle: 'Project',
    records: [
      {
        startTime: Date.UTC(2026, 6, 29, 8),
        taskText: 'Write notes',
        timeRange: 'Today · 08:00–08:25',
        duration: '25 min',
        taskStart: 10,
      },
      {
        startTime: Date.UTC(2026, 6, 29, 10),
        taskText: 'Write notes',
        timeRange: 'Today · 10:00–10:25',
        duration: '25 min',
        taskStart: 10,
      },
    ],
  },
];

const mountList = (focusGroups = groups) =>
  mount(AgendaFocusRecordList, {
    props: { groups: focusGroups, emptyTitle: 'No focus records' },
    global: {
      stubs: {
        AppBadge: AppBadgeStub,
        AppSpoiler: AppSpoilerStub,
        AppTitle: AppTitleStub,
        EmptyState: EmptyStateStub,
        MenuItem: MenuItemStub,
        OverflowLine: true,
      },
    },
  });

test('focus record list groups intervals by file using the flat Agenda surface', () => {
  const wrapper = mountList();
  expect(wrapper.getComponent(AppSpoilerStub).props('variant')).toBe('flat');
  expect(wrapper.getComponent(MenuGroup).findAll('.record-stub')).toHaveLength(2);
  expect(wrapper.text()).toContain('Project');
  expect(wrapper.getComponent(AppBadgeStub).props('label')).toBe('2');
});

test('focus record list keeps repeated intervals and emits the selected record', async () => {
  const wrapper = mountList();
  await wrapper.findAll('.record-stub')[1]?.trigger('click');
  expect(wrapper.emitted('select-record')).toEqual([[groups[0]?.records[1], '/notes/project.org']]);
});

test('focus record list renders the shared empty state', () => {
  const wrapper = mountList([]);
  expect(wrapper.getComponent(EmptyStateStub).text()).toBe('No focus records');
  expect(wrapper.findComponent(AppSpoilerStub).exists()).toBe(false);
});
