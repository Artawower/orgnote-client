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
import { format } from 'date-fns';
import { to } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { openNoteAtPosition } from 'src/utils/editor-navigation';
import { formatDurationMin } from '../utils/format-duration';
import type { FocusInterval } from '../utils/focus-statistics';
import AgendaFocusRecordList from './AgendaFocusRecordList.vue';
import type {
  AgendaFocusRecordGroup,
  AgendaFocusRecordItem,
} from './agenda-focus-record-types';

const TIME_FORMAT = 'HH:mm';

const props = defineProps<{ intervals: readonly FocusInterval[] }>();
const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const toRecord = (interval: FocusInterval): AgendaFocusRecordItem => ({
  startTime: interval.startTime,
  taskText: interval.taskText,
  timeRange: `${format(interval.startTime, TIME_FORMAT)}–${format(interval.endTime, TIME_FORMAT)}`,
  duration: formatDurationMin(interval.durationMin),
  taskStart: interval.taskStart,
});

const groups = computed<AgendaFocusRecordGroup[]>(() => {
  const groupsByPath = new Map<string, AgendaFocusRecordGroup>();
  props.intervals.forEach((interval) => {
    const group = groupsByPath.get(interval.filePath) ?? {
      filePath: interval.filePath,
      fileTitle: interval.fileTitle,
      records: [],
    };
    groupsByPath.set(interval.filePath, {
      ...group,
      records: [...group.records, toRecord(interval)],
    });
  });
  return [...groupsByPath.values()].sort((left, right) =>
    left.fileTitle.localeCompare(right.fileTitle),
  );
});

const onRecordSelect = async (
  record: AgendaFocusRecordItem,
  filePath: string,
): Promise<void> => {
  const result = await to(() => openNoteAtPosition(api, filePath, record.taskStart))();
  if (result.isErr()) reporter.reportError(result.error);
};
</script>
