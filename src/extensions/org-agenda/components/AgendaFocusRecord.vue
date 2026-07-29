<template>
  <agenda-focus-record-list
    :groups="groups"
    :empty-title="t(i18nKeys.orgAgendaNoTasksTitle)"
    @select-record="onRecordSelect"
  />
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { format, isToday, isYesterday } from 'date-fns';
import { join, type FileMeta, type FileTask } from 'orgnote-api';
import type { ClockEntry } from 'org-mode-ast';
import { to } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { openNoteAtPosition } from 'src/utils/editor-navigation';
import { extractOrgTitleFromPath } from 'src/utils/extract-org-title-from-path';
import { useAgendaTasksStore } from '../stores/agenda-tasks-store';
import { formatDurationMin } from '../utils/format-duration';
import AgendaFocusRecordList from './AgendaFocusRecordList.vue';
import type {
  AgendaFocusRecordGroup,
  AgendaFocusRecordItem,
} from './agenda-focus-record-types';

const MINUTE_MS = 60_000;
const DATE_FORMAT = 'MMM d';
const TIME_FORMAT = 'HH:mm';

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const store = useAgendaTasksStore();

const dateLabel = (date: Date): string => {
  if (isToday(date)) return t(i18nKeys.orgAgendaFocusToday);
  if (isYesterday(date)) return t(i18nKeys.orgAgendaFocusYesterday);
  return format(date, DATE_FORMAT);
};

const resolveFilePath = (file: FileMeta): string => join('/', ...file.filePath);

const resolveFileTitle = (file: FileMeta, filePath: string): string =>
  file.title?.trim() || extractOrgTitleFromPath(filePath);

const toRecord = (clock: ClockEntry, task: FileTask): AgendaFocusRecordItem[] => {
  if (!clock.date || !clock.to) return [];
  const start = new Date(clock.date);
  const end = new Date(clock.to);
  const duration = Math.floor((end.getTime() - start.getTime()) / MINUTE_MS);
  if (duration <= 0) return [];
  const timeRange = `${format(start, TIME_FORMAT)}–${format(end, TIME_FORMAT)}`;
  return [
    {
      startTime: start.getTime(),
      taskText: task.text,
      timeRange: `${dateLabel(start)} · ${timeRange}`,
      duration: formatDurationMin(duration),
      taskStart: task.start ?? 0,
    },
  ];
};

const toGroup = (file: FileMeta): AgendaFocusRecordGroup[] => {
  const filePath = resolveFilePath(file);
  const records = (file.tasks ?? [])
    .flatMap((task) => (task.clocks ?? []).flatMap((clock) => toRecord(clock, task)))
    .sort((left, right) => right.startTime - left.startTime);
  if (!records.length) return [];
  return [{ filePath, fileTitle: resolveFileTitle(file, filePath), records }];
};

const groups = computed<AgendaFocusRecordGroup[]>(() =>
  store.allFiles
    .flatMap(toGroup)
    .sort((left, right) => left.fileTitle.localeCompare(right.fileTitle)),
);

const onRecordSelect = async (
  record: AgendaFocusRecordItem,
  filePath: string,
): Promise<void> => {
  const result = await to(() => openNoteAtPosition(api, filePath, record.taskStart))();
  if (result.isErr()) reporter.reportError(result.error);
};
</script>
