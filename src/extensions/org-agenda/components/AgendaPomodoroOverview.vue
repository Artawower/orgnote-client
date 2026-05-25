<template>
  <card-wrapper>
    <div v-for="stat in statList" :key="stat.label" class="stat-row">
      <span class="stat-label">{{ stat.label }}</span>
      <span class="stat-value">{{ stat.value }}</span>
    </div>
  </card-wrapper>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { isToday } from 'date-fns';
import CardWrapper from 'src/components/CardWrapper.vue';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { useAgendaTasksStore } from '../stores/agenda-tasks-store';
import type { ClockEntry } from 'org-mode-ast';

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const store = useAgendaTasksStore();

const MINUTES_PER_HOUR = 60;

const clockDurationMin = (c: ClockEntry): number => {
  if (!c.to || !c.date) return 0;
  return Math.floor((new Date(c.to).getTime() - new Date(c.date).getTime()) / 60000);
};

const isValidClock = (c: ClockEntry): boolean => !!c.to && clockDurationMin(c) > 0;

const allClocks = computed<ClockEntry[]>(() =>
  store.allFiles.flatMap((file) =>
    (file.tasks ?? []).flatMap((task) => (task.clocks ?? []).filter(isValidClock)),
  ),
);

const todayClocks = computed(() =>
  allClocks.value.filter((c) => c.date && isToday(new Date(c.date))),
);

const formatDuration = (min: number): string => {
  const h = Math.floor(min / MINUTES_PER_HOUR);
  const m = min % MINUTES_PER_HOUR;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const statList = computed(() => [
  { label: t(i18nKeys.orgAgendaPomodoroTodayPomo), value: String(todayClocks.value.length) },
  {
    label: t(i18nKeys.orgAgendaPomodoroTodayFocus),
    value: formatDuration(todayClocks.value.reduce((s, c) => s + clockDurationMin(c), 0)),
  },
  { label: t(i18nKeys.orgAgendaPomodoroTotalPomo), value: String(allClocks.value.length) },
  {
    label: t(i18nKeys.orgAgendaPomodoroTotalFocus),
    value: formatDuration(allClocks.value.reduce((s, c) => s + clockDurationMin(c), 0)),
  },
]);
</script>

<style lang="scss" scoped>
.stat-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--menu-item-padding-y) var(--menu-item-padding-x);
  min-height: var(--menu-item-height-sm);

  & + & {
    border-top: var(--border-default);
  }
}

.stat-label {
  font-size: var(--font-size-md);
  color: var(--fg);
}

.stat-value {
  font-size: var(--font-size-md);
  font-weight: 600;
  color: var(--fg);
  white-space: nowrap;
  margin-left: var(--gap-md);
}
</style>
