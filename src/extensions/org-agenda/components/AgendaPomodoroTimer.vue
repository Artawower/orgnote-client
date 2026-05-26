<template>
  <app-flex column align-center center full-height gap="lg" class="pomodoro-timer">
    <app-segmented-control
      v-model="sessionType"
      :options="modeOptions"
      :disabled="hasSession"
      size="md"
    />

    <app-button
      class="task-eyebrow"
      type="plain"
      size="sm"
      :disabled="hasSession"
      @click="onSelectTask"
    >
      <app-flex row align-center gap="xs">
        <app-icon name="sym_o_task_alt" size="xs" />
        <span class="task-label">{{ taskLabel }}</span>
      </app-flex>
    </app-button>

    <div class="ring-wrapper">
      <svg
        class="progress-ring"
        :class="{ 'ring-spinning': sessionType === 'stopwatch' && isRunning }"
        :viewBox="`0 0 ${SVG_SIZE} ${SVG_SIZE}`"
      >
        <circle class="ring-track" :cx="SVG_CENTER" :cy="SVG_CENTER" :r="RING_RADIUS" />
        <circle
          v-if="sessionType === 'pomo' && hasSession"
          class="ring-fill"
          :cx="SVG_CENTER"
          :cy="SVG_CENTER"
          :r="RING_RADIUS"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
        />
        <circle
          v-if="sessionType === 'stopwatch'"
          class="ring-fill ring-arc"
          :cx="SVG_CENTER"
          :cy="SVG_CENTER"
          :r="RING_RADIUS"
          :stroke-dasharray="`${arcLength} ${circumference - arcLength}`"
          stroke-dashoffset="0"
        />
      </svg>
      <app-flex class="ring-content" column align-center center gap="xxs" @click="onRingClick">
        <span v-if="hasSession" class="display-time">{{ displayTime }}</span>
        <app-flex v-else-if="sessionType === 'pomo'" row align-end gap="xs" class="duration-row">
          <app-input
            v-model="localDuration"
            class="duration-input"
            type="number"
            @click.stop
            @change="onDurationChange"
          />
          <span class="duration-unit">min</span>
        </app-flex>
        <span v-else class="display-time muted">00:00</span>
        <span class="phase-label">{{ phaseLabel }}</span>
      </app-flex>
    </div>

    <app-flex column align-center gap="sm" class="actions">
      <command-action-button
        v-if="!hasSession"
        :command="AGENDA_POMODORO_START_COMMAND"
        :text="t(i18nKeys.orgAgendaPomodoroStart)"
        size="md"
        alignment="left"
        include-text
      />
      <command-action-button
        v-else-if="isPaused"
        :command="AGENDA_POMODORO_RESUME_COMMAND"
        :text="t(i18nKeys.orgAgendaPomodoroResume)"
        size="md"
        alignment="left"
        include-text
      />
      <command-action-button
        v-else
        :command="AGENDA_POMODORO_PAUSE_COMMAND"
        :text="t(i18nKeys.orgAgendaPomorodoPause)"
        alignment="left"
        size="md"
        include-text
      />
      <command-action-button
        :command="AGENDA_POMODORO_STOP_COMMAND"
        :text="t(i18nKeys.orgAgendaPomodoroStop)"
        :class="{ invisible: !hasSession }"
        alignment="left"
        size="md"
        include-text
      />
    </app-flex>

    <span v-if="todayPomoCount > 0" class="session-counter">
      {{ t(i18nKeys.orgAgendaPomodoroTodayCount, { count: todayPomoCount }) }}
    </span>
  </app-flex>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { isToday } from 'date-fns';
import { storeToRefs } from 'pinia';
import AppFlex from 'src/components/AppFlex.vue';
import AppButton from 'src/components/AppButton.vue';
import AppSegmentedControl from 'src/components/AppSegmentedControl.vue';
import AppIcon from 'src/components/AppIcon.vue';
import AppInput from 'src/components/AppInput.vue';
import CommandActionButton from 'src/containers/CommandActionButton.vue';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import {
  AGENDA_POMODORO_START_COMMAND,
  AGENDA_POMODORO_PAUSE_COMMAND,
  AGENDA_POMODORO_RESUME_COMMAND,
  AGENDA_POMODORO_STOP_COMMAND,
} from '../constants';
import { usePomodoroStore } from '../stores/pomodoro-store';
import { useAgendaTasksStore } from '../stores/agenda-tasks-store';

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const store = usePomodoroStore();
const tasksStore = useAgendaTasksStore();

const SVG_SIZE = 280;
const SVG_CENTER = SVG_SIZE / 2;
const RING_RADIUS = 120;
const circumference = 2 * Math.PI * RING_RADIUS;
const arcLength = circumference * 0.25;

const {
  displayTime,
  progress,
  isRunning,
  isPaused,
  hasSession,
  session,
  durationMin,
  sessionType,
  pendingTask,
} = storeToRefs(store);

const localDuration = ref<number>(durationMin.value);
watch(durationMin, (v) => {
  localDuration.value = v;
});

const dashOffset = computed(() => circumference * (1 - progress.value));

const taskLabel = computed(
  () =>
    session.value?.taskText ??
    pendingTask.value?.text ??
    t(i18nKeys.orgAgendaPomodoroNoTaskSelected),
);

const modeOptions = computed(() => [
  { value: 'pomo' as const, label: t(i18nKeys.orgAgendaPomodoroPhasePomodoro) },
  { value: 'stopwatch' as const, label: t(i18nKeys.orgAgendaPomodoroPhaseStopwatch) },
]);

const phaseLabel = computed(() =>
  sessionType.value === 'pomo'
    ? t(i18nKeys.orgAgendaPomodoroPhasePomodoro)
    : t(i18nKeys.orgAgendaPomodoroPhaseStopwatch),
);

const todayPomoCount = computed(
  () =>
    tasksStore.allFiles
      .flatMap((f) => f.tasks ?? [])
      .flatMap((task) => task.clocks ?? [])
      .filter((c) => !!c.to && !!c.date && isToday(new Date(c.date))).length,
);

const onDurationChange = (): void => {
  store.durationMin = localDuration.value;
};

const onSelectTask = async (): Promise<void> => {
  if (hasSession.value) return;
  const task = await store.openTaskCompletion();
  if (task) pendingTask.value = task;
};

const onRingClick = (): void => {
  if (isRunning.value) store.pauseSession();
  else if (isPaused.value) store.resumeSession();
};
</script>

<style lang="scss" scoped>
.pomodoro-timer {
  padding: var(--gap-xl) var(--gap-md);
}

.task-eyebrow {
  background: transparent !important;
  opacity: 0.55;
  max-width: 260px;

  @include hover {
    background: transparent !important;
    opacity: 1;
  }

  &:disabled {
    background: transparent !important;
    opacity: 0.3;
  }
}

.task-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @include fontify(var(--font-size-sm), var(--font-weight-regular), false);
}

.ring-wrapper {
  position: relative;
  width: 280px;
  height: 280px;
  flex-shrink: 0;
}

.progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.ring-track {
  fill: none;
  stroke: rgba(128, 128, 128, 0.2);
  stroke-width: 12;
}

.ring-fill {
  fill: none;
  stroke: #4f8ef7;
  stroke-width: 12;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.9s linear;
}

.ring-arc {
  transition: none;
  opacity: 0.3;
}

.ring-spinning {
  animation: ring-spin 2.8s linear infinite;
  transform-origin: center;

  .ring-arc {
    opacity: 1;
  }
}

@keyframes ring-spin {
  from {
    transform: rotate(-90deg);
  }
  to {
    transform: rotate(270deg);
  }
}

.ring-content {
  position: absolute;
  inset: 0;
  cursor: pointer;
}

.display-time {
  font-size: 56px;
  font-weight: var(--font-weight-regular);
  color: var(--fg);
  letter-spacing: 4px;
  line-height: 1;
  font-variant-numeric: tabular-nums;

  &.muted {
    color: var(--fg-muted);
  }
}

.duration-row {
  line-height: 1;
}

.duration-input {
  width: 80px;
  font-size: 56px;
  font-weight: var(--font-weight-regular);
  text-align: right;
  line-height: 1;
  font-variant-numeric: tabular-nums;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    display: none;
  }
}

.duration-unit {
  @include fontify(var(--font-size-md), var(--font-weight-regular), false);
  color: var(--fg-muted);
  padding-bottom: 8px;
}

.phase-label {
  @include fontify(var(--font-size-xs), var(--font-weight-regular), false);
  color: var(--fg-muted);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  opacity: 0.5;
}

.invisible {
  visibility: hidden;
  pointer-events: none;
}

.session-counter {
  @include fontify(var(--font-size-xs), var(--font-weight-regular), false);
  color: var(--fg-muted);
  opacity: 0.4;
}
</style>
