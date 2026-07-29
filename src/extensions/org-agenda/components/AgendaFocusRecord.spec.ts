import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { expect, test, vi } from 'vitest';
import type { AgendaFocusRecordGroup } from './agenda-focus-record-types';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({ t: (key: string) => key }),
}));

vi.mock('../stores/agenda-tasks-store', () => ({
  useAgendaTasksStore: () => ({
    allFiles: [
      {
        filePath: ['notes', 'project.org'],
        title: 'Project',
        tasks: [
          {
            id: 'write-notes',
            text: 'Write notes',
            start: 42,
            clocks: [
              { date: '2026-07-29T08:00:00', to: '2026-07-29T08:25:00' },
              { date: '2026-07-29T10:00:00', to: '2026-07-29T10:25:00' },
              { date: '2026-07-29T12:00:00' },
            ],
          },
        ],
      },
    ],
  }),
}));

vi.mock('src/boot/api', () => ({ api: {} }));
vi.mock('src/boot/report', () => ({ reporter: { reportError: vi.fn() } }));
vi.mock('src/utils/editor-navigation', () => ({ openNoteAtPosition: vi.fn() }));

import AgendaFocusRecord from './AgendaFocusRecord.vue';

const AgendaFocusRecordListStub = defineComponent({
  name: 'AgendaFocusRecordList',
  props: { groups: Array, emptyTitle: String },
  template: '<div />',
});

test('focus records are grouped by file without merging repeated task intervals', () => {
  const wrapper = mount(AgendaFocusRecord, {
    global: { stubs: { AgendaFocusRecordList: AgendaFocusRecordListStub } },
  });
  const groups = wrapper.getComponent(AgendaFocusRecordListStub).props(
    'groups',
  ) as AgendaFocusRecordGroup[];
  expect(groups).toHaveLength(1);
  expect(groups[0]).toMatchObject({ filePath: '/notes/project.org', fileTitle: 'Project' });
  expect(groups[0]?.records).toHaveLength(2);
  expect(groups[0]?.records.map(({ taskText }) => taskText)).toEqual(['Write notes', 'Write notes']);
  expect(groups[0]?.records[0]?.startTime).toBeGreaterThan(groups[0]?.records[1]?.startTime ?? 0);
});
