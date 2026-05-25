<template>
  <app-flex column align-center center full-height gap="xl" class="pomodoro-timer">
    <app-flex row gap="xs" class="type-tabs">
      <button
        type="button"
        class="tab-btn"
        :class="{ active: sessionType === 'pomo' }"
        :disabled="hasSession"
        @click="onTabClick('pomo')"
      >
        Pomo
      </button>
      <button
        type="button"
        class="tab-btn"
        :class="{ active: sessionType === 'stopwatch' }"
        :disabled="hasSession"
        @click="onTabClick('stopwatch')"
      >
        Stopwatch
      </button>
    </app-flex>

    <button
      type="button"
      class="task-btn"
      :disabled="hasSession"
      :class="{ disabled: hasSession }"
      @click="onSelectTask"
    >
      <span class="task-btn-text">{{ taskLabel }}</span>
      <app-icon name="sym_o_chevron_right" size="sm" class="task-chevron" />
    </button>

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
      <div class="ring-content" @click="onRingClick">
        <span v-if="hasSession" class="display-time">{{ displayTime }}</span>
        <div v-else-if="sessionType === 'pomo'" class="duration-row">
          <input
            v-model.number="localDuration"
            class="duration-input"
            type="number"
            min="1"
            max="180"
            @click.stop
            @change="onDurationChange"
          />
          <span class="duration-unit">min</span>
        </div>
        <span v-else class="display-time muted">00:00</span>
      </div>
    </div>

    <app-flex row align-center gap="md">
      <command-action-button
        v-if="!hasSession"
        :command="AGENDA_POMODORO_START_COMMAND"
        size="lg"
      />
      <command-action-button
        v-else-if="isPaused"
        :command="AGENDA_POMODORO_RESUME_COMMAND"
        size="lg"
      />
      <command-action-button v-else :command="AGENDA_POMODORO_PAUSE_COMMAND" size="lg" />
      <command-action-button v-if="hasSession" :command="AGENDA_POMODORO_STOP_COMMAND" size="lg" />
    </app-flex>
  </app-flex>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import AppFlex from 'src/components/AppFlex.vue';
import AppIcon from 'src/components/AppIcon.vue';
import CommandActionButton from 'src/containers/CommandActionButton.vue';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import {
  AGENDA_POMODORO_START_COMMAND,
  AGENDA_POMODORO_PAUSE_COMMAND,
  AGENDA_POMODORO_RESUME_COMMAND,
  AGENDA_POMODORO_STOP_COMMAND,
} from '../constants';
import { usePomodoroStore } from '../stores/pomodoro-store';

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const store = usePomodoroStore();

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

const localDuration = ref(durationMin.value);
watch(durationMin, (v) => {
  localDuration.value = v;
});

const dashOffset = computed(() => circumference * (1 - progress.value));

const taskLabel = computed(
  () => session.value?.taskText ?? t(i18nKeys.orgAgendaPomodoroNoTaskSelected),
);

const onDurationChange = (): void => {
  store.durationMin = localDuration.value;
};

const onTabClick = (type: 'pomo' | 'stopwatch'): void => {
  if (hasSession.value) return;
  store.sessionType = type;
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

.type-tabs {
  background: var(--bg-alt);
  border-radius: 999px;
  padding: 3px;
}

.tab-btn {
  padding: var(--gap-xs) var(--gap-lg);
  border: none;
  border-radius: 999px;
  background: transparent;
  color: var(--fg-muted);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;

  &.active {
    background: var(--bg);
    color: var(--fg);
  }

  &:disabled {
    opacity: 0.4;
    cursor: default;
  }
}

.task-btn {
  display: flex;
  align-items: center;
  gap: var(--gap-xs);
  border: none;
  background: transparent;
  color: var(--fg-muted);
  cursor: pointer;
  font-size: var(--font-size-sm);
  max-width: 260px;
  transition: color 0.15s;

  &:hover:not(.disabled) {
    color: var(--fg);
  }

  &.disabled {
    cursor: default;
    opacity: 0.5;
  }
}

.task-btn-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.task-chevron {
  flex-shrink: 0;
  opacity: 0.5;
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
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.display-time {
  font-size: 56px;
  font-weight: 300;
  color: var(--fg);
  letter-spacing: 4px;
  line-height: 1;
  font-variant-numeric: tabular-nums;

  &.muted {
    color: var(--fg-muted);
  }
}

.duration-row {
  display: flex;
  align-items: flex-end;
  gap: 4px;
}

.duration-input {
  width: 80px;
  font-size: 56px;
  font-weight: 300;
  text-align: right;
  background: transparent;
  border: none;
  color: var(--fg);
  outline: none;
  line-height: 1;
  font-variant-numeric: tabular-nums;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    display: none;
  }
}

.duration-unit {
  font-size: var(--font-size-md);
  color: var(--fg-muted);
  padding-bottom: 10px;
}
</style>
