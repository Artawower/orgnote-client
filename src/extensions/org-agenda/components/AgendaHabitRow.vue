<template>
  <app-flex row align-center gap="md" class="habit-row">
    <app-flex column start align-start class="habit-body" gap="xs">
      <overflow-line class="habit-title">{{ habit.text }}</overflow-line>
      <app-flex row align-center gap="sm" class="habit-stats">
        <span class="stat-item stat-total"
          >⚡ {{ t(i18nKeys.orgAgendaHabitsTotalDays, { count: habit.totalDays }) }}</span
        >
        <span class="stat-item stat-streak"
          >🔥 {{ t(i18nKeys.orgAgendaHabitsCurrentStreak, { count: habit.currentStreak }) }}</span
        >
      </app-flex>
    </app-flex>

    <app-flex row align-center gap="md" class="habit-actions" @click.stop>
      <command-action-button :command="AGENDA_POMODORO_START_COMMAND" :data="habit" size="md" />
      <action-button
        icon="sym_o_open_in_new"
        size="md"
        :aria-label="t(i18nKeys.orgAgendaOpenNote)"
        @click="emit('open-note')"
      />
      <app-radio-button
        size="lg"
        :model-value="completedOnDay"
        :aria-label="toggleLabel"
        @change="emit('toggle')"
      />
    </app-flex>
  </app-flex>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { todayIsoDate } from 'src/utils/org-date';
import AppFlex from 'src/components/AppFlex.vue';
import ActionButton from 'src/components/ActionButton.vue';
import CommandActionButton from 'src/containers/CommandActionButton.vue';
import { AGENDA_POMODORO_START_COMMAND } from '../constants';
import AppRadioButton from 'src/components/AppRadioButton.vue';
import OverflowLine from 'src/components/OverflowLine.vue';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { clockMatchesDate } from '../composables/use-habits';
import type { AgendaHabitView } from '../types';

const props = defineProps<{ habit: AgendaHabitView; selectedDate: string }>();
const emit = defineEmits<{ toggle: []; 'open-note': [] }>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const completedOnDay = computed(() => clockMatchesDate(props.habit, props.selectedDate));

const isToday = computed(() => props.selectedDate === todayIsoDate());

const toggleLabel = computed(() => {
  if (completedOnDay.value) {
    return t(isToday.value ? i18nKeys.orgAgendaHabitsCompletedToday : i18nKeys.orgAgendaHabitsDone);
  }
  return t(
    isToday.value ? i18nKeys.orgAgendaHabitsCompleteToday : i18nKeys.orgAgendaHabitsMarkDone,
  );
});
</script>

<style lang="scss" scoped>
.habit-row {
  padding: var(--menu-item-padding-y) var(--menu-item-padding-x);
  min-height: var(--menu-item-height-sm);
}

.habit-body {
  flex: 1;
  min-width: 0;
}

.habit-title {
  font-size: var(--font-size-md);
  color: var(--fg);
}

.habit-stats {
  gap: var(--gap-sm);
}

.stat-item {
  font-size: var(--font-size-xs);
  color: var(--fg-muted);
}

.stat-total {
  color: var(--yellow);
}

.stat-streak {
  color: var(--red);
}
</style>
