<template>
  <app-flex column start align-stretch gap="sm">
    <span v-if="groupedRecords.length === 0" class="empty-state">
      {{ t(i18nKeys.orgAgendaNoTasksTitle) }}
    </span>

    <app-spoiler
      v-for="group in groupedRecords"
      :key="group.date"
      variant="card-static"
      max-height="none"
      default-expanded
    >
      <template #title>{{ group.label }}</template>
      <template #body>
        <menu-item
          v-for="(entry, idx) in group.entries"
          :key="idx"
          :lines="2"
          :capitalize="false"
          flat
          @click="onEntryClick(entry)"
        >
          <app-flex column align-start gap="xxs" class="entry-content">
            <span class="entry-time">{{ entry.timeRange }}</span>
            <app-flex row start align-center gap="xs">
              <app-icon name="sym_o_task_alt" size="xs" color="fg-muted" />
              <span class="entry-task">{{ entry.taskText }}</span>
            </app-flex>
          </app-flex>
          <template #right>
            <span class="entry-duration">{{ entry.duration }}</span>
          </template>
        </menu-item>
      </template>
    </app-spoiler>
  </app-flex>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { format, isToday, isYesterday } from 'date-fns';
import AppFlex from 'src/components/AppFlex.vue';
import AppIcon from 'src/components/AppIcon.vue';
import AppSpoiler from 'src/components/AppSpoiler.vue';
import MenuItem from 'src/containers/MenuItem.vue';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { useAgendaTasksStore } from '../stores/agenda-tasks-store';
import { openNoteAtPosition } from 'src/utils/editor-navigation';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import { to } from 'orgnote-api/utils';
import { MINUTES_PER_HOUR } from '../constants';
import type { ClockEntry } from 'org-mode-ast';
import type { FileTask, FileMeta } from 'orgnote-api';

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const store = useAgendaTasksStore();

const DATE_FORMAT = 'MMM d';
const TIME_FORMAT = 'HH:mm';

interface FocusEntry {
  timeRange: string;
  duration: string;
  taskText: string;
  startDate: Date;
  filePath: string;
  taskStart: number;
}

interface FocusGroup {
  date: string;
  label: string;
  entries: FocusEntry[];
}

const clockDurationMin = (c: ClockEntry): number => {
  if (!c.to || !c.date) return 0;
  return Math.floor((new Date(c.to).getTime() - new Date(c.date).getTime()) / 60000);
};

const formatDurationMin = (min: number): string => {
  const h = Math.floor(min / MINUTES_PER_HOUR);
  const m = min % MINUTES_PER_HOUR;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const dateGroupLabel = (d: Date): string => {
  if (isToday(d)) return t(i18nKeys.orgAgendaFocusToday);
  if (isYesterday(d)) return t(i18nKeys.orgAgendaFocusYesterday);
  return format(d, DATE_FORMAT);
};

const resolveFilePath = (file: FileMeta): string => `/${file.filePath.join('/')}`;

const toEntry = (clock: ClockEntry, task: FileTask, filePath: string): FocusEntry => {
  const start = new Date(clock.date!);
  const end = new Date(clock.to!);
  return {
    startDate: start,
    timeRange: `${format(start, TIME_FORMAT)} – ${format(end, TIME_FORMAT)}`,
    duration: formatDurationMin(clockDurationMin(clock)),
    taskText: task.text,
    filePath,
    taskStart: task.start ?? 0,
  };
};

const allEntries = computed<FocusEntry[]>(() =>
  store.allFiles
    .flatMap((file) => {
      const filePath = resolveFilePath(file);
      return (file.tasks ?? []).flatMap((task) =>
        (task.clocks ?? [])
          .filter((c) => !!c.to && clockDurationMin(c) > 0)
          .map((c) => toEntry(c, task, filePath)),
      );
    })
    .sort((a, b) => b.startDate.getTime() - a.startDate.getTime()),
);

const groupedRecords = computed<FocusGroup[]>(() => {
  const map = new Map<string, FocusGroup>();
  allEntries.value.forEach((entry) => {
    const key = format(entry.startDate, 'yyyy-MM-dd');
    if (!map.has(key)) {
      map.set(key, { date: key, label: dateGroupLabel(entry.startDate), entries: [] });
    }
    map.get(key)!.entries.push(entry);
  });
  return [...map.values()];
});

const onEntryClick = async (entry: FocusEntry): Promise<void> => {
  const result = await to(() => openNoteAtPosition(api, entry.filePath, entry.taskStart))();
  if (result.isErr()) reporter.reportError(result.error);
};
</script>

<style lang="scss" scoped>
:deep(.spoiler-body) {
  padding: 0;
}

.entry-content {
  white-space: normal;
  min-width: 0;
}

.entry-time {
  @include fontify(var(--font-size-sm), var(--font-weight-regular), false);
  color: var(--fg);
}

.entry-task {
  @include fontify(var(--font-size-sm), var(--font-weight-regular), false);
  color: var(--fg-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.entry-duration {
  @include fontify(var(--font-size-sm), var(--font-weight-regular), false);
  color: var(--fg-muted);
  white-space: nowrap;
}

.empty-state {
  @include fontify(var(--font-size-sm), var(--font-weight-regular), false);
  color: var(--fg-muted);
  padding: var(--gap-md) var(--menu-item-padding-x);
}
</style>
