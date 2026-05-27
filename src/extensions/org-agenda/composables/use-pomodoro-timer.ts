import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { isToday } from 'date-fns';
import { storeToRefs } from 'pinia';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { POMODORO_MIN_DURATION_MIN, POMODORO_MAX_DURATION_MIN } from '../constants';
import { usePomodoroStore } from '../stores/pomodoro-store';
import { useAgendaTasksStore } from '../stores/agenda-tasks-store';

export const usePomodoroTimer = () => {
  const { t } = useI18n({ useScope: 'global', inheritLocale: true });
  const store = usePomodoroStore();
  const tasksStore = useAgendaTasksStore();

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
        .filter((c) => !!c.to && !!c.date && isToday(new Date(c.date)))
        .filter((c) => new Date(c.to!).getTime() - new Date(c.date!).getTime() > 0).length,
  );

  const onDurationChange = (value: number): void => {
    const clamped = Math.max(
      POMODORO_MIN_DURATION_MIN,
      Math.min(POMODORO_MAX_DURATION_MIN, value || POMODORO_MIN_DURATION_MIN),
    );
    store.durationMin = clamped;
    localDuration.value = clamped;
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

  return {
    t,
    displayTime,
    progress,
    isRunning,
    isPaused,
    hasSession,
    durationMin,
    sessionType,
    localDuration,
    taskLabel,
    modeOptions,
    phaseLabel,
    todayPomoCount,
    onDurationChange,
    onSelectTask,
    onRingClick,
  };
};
