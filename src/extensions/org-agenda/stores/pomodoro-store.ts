import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { FileTask } from 'orgnote-api';
import { to, uint8ArrayToText, textToUint8Array, isPresent } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import { i18n } from 'src/boot/i18n';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { appendClock } from '../mutations/clock';
import {
  STOPWATCH_MAX_SECONDS,
  POMODORO_ACTIVE_SESSION_KEY,
  POMODORO_LAST_TASK_KEY,
  SECONDS_PER_MINUTE,
} from '../constants';
import { useAgendaTasksStore } from './agenda-tasks-store';
import { orgAgendaManifest } from '../manifest';
import { resolveAgendaConfig } from '../index';

export interface PomodoroTask {
  taskId: string;
  taskText: string;
  filePath: string;
  taskStart: number;
}

interface ActiveSession extends PomodoroTask {
  segmentStartedAt: string;
  accumulatedSeconds: number;
  duration: number;
  type: 'pomo' | 'stopwatch';
  paused: boolean;
}

const TIMER_INTERVAL_MS = 1000;
const t = i18n.global.t;

const formatTwoDigits = (n: number): string => String(Math.floor(n)).padStart(2, '0');

const toDisplay = (totalSeconds: number): string => {
  const mins = Math.floor(totalSeconds / SECONDS_PER_MINUTE);
  const secs = totalSeconds % SECONDS_PER_MINUTE;
  return `${formatTwoDigits(mins)}:${formatTwoDigits(secs)}`;
};

const playBeep = (): void => {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.8);
  osc.onended = () => void ctx.close();
};

const applyFileMutation = async (
  filePath: string,
  mutation: (content: string) => string,
): Promise<void> => {
  const fileContent = api.core.useFileContent();
  const readResult = await to(fileContent.read)(filePath);
  if (readResult.isErr()) {
    reporter.reportError(readResult.error);
    return;
  }
  const content = uint8ArrayToText(readResult.value);
  const next = mutation(content);
  if (next === content) return;
  const writeResult = await to(fileContent.write)(filePath, textToUint8Array(next));
  if (writeResult.isErr()) reporter.reportError(writeResult.error);
};

const segmentElapsedSec = (s: ActiveSession): number =>
  Math.floor((Date.now() - new Date(s.segmentStartedAt).getTime()) / 1000);

const writeSegmentClock = async (s: ActiveSession, endedAt: Date): Promise<void> =>
  applyFileMutation(s.filePath, (content) =>
    appendClock(content, s.taskStart, new Date(s.segmentStartedAt), endedAt),
  );

export const usePomodoroStore = defineStore('pomodoro', () => {
  const agendaConfig = computed(() =>
    resolveAgendaConfig(api.core.useExtensions().getExtensionConfig(orgAgendaManifest.name).value),
  );

  const session = ref<ActiveSession | null>(null);
  const elapsed = ref(0);
  const isPaused = ref(false);
  const durationMin = ref(agendaConfig.value.pomoDuration);
  const sessionType = ref<'pomo' | 'stopwatch'>('pomo');
  const pendingTask = ref<(FileTask & { filePath: string }) | null>(null);
  let intervalHandle: ReturnType<typeof setInterval> | null = null;

  const kvRepo = computed(() => api.infrastructure.keyValueRepository);
  const durationSeconds = computed(() => durationMin.value * SECONDS_PER_MINUTE);
  const isRunning = computed(() => isPresent(session.value) && !isPaused.value);
  const hasSession = computed(() => isPresent(session.value));

  const progress = computed(() => {
    if (sessionType.value === 'stopwatch') return 0;
    return Math.min(1, elapsed.value / durationSeconds.value);
  });

  const displayTime = computed(() => {
    if (sessionType.value === 'stopwatch')
      return toDisplay(Math.min(elapsed.value, STOPWATCH_MAX_SECONDS));
    return toDisplay(Math.max(0, durationSeconds.value - elapsed.value));
  });

  const persistSession = async (s: ActiveSession): Promise<void> => {
    await to(kvRepo.value.set)(POMODORO_ACTIVE_SESSION_KEY, JSON.stringify(s));
  };

  const clearPersistedSession = async (): Promise<void> => {
    await to(kvRepo.value.delete)(POMODORO_ACTIVE_SESSION_KEY);
  };

  const persistLastTask = async (task: PomodoroTask): Promise<void> => {
    await to(kvRepo.value.set)(POMODORO_LAST_TASK_KEY, JSON.stringify(task));
  };

  const resetState = (): void => {
    session.value = null;
    elapsed.value = 0;
    isPaused.value = false;
  };

  const notifyComplete = (): void => {
    api.core.useNotifications().notify({
      message: t(i18nKeys.orgAgendaPomodoroComplete),
      level: 'info',
      timeout: 5000,
    });
    if (agendaConfig.value.soundEnabled) playBeep();
  };

  const stopTick = (): void => {
    if (!intervalHandle) return;
    clearInterval(intervalHandle);
    intervalHandle = null;
  };

  const startTick = (): void => {
    intervalHandle = setInterval(async () => {
      const s = session.value;
      if (!s || isPaused.value) return;
      elapsed.value = s.accumulatedSeconds + segmentElapsedSec(s);
      if (s.type !== 'pomo' || elapsed.value < durationSeconds.value) return;
      stopTick();
      const remaining = durationSeconds.value - s.accumulatedSeconds;
      const segEnd = new Date(new Date(s.segmentStartedAt).getTime() + remaining * 1000);
      await writeSegmentClock(s, segEnd);
      await clearPersistedSession();
      resetState();
      notifyComplete();
    }, TIMER_INTERVAL_MS);
  };

  const startSession = async (
    task: FileTask & { filePath: string },
    type: 'pomo' | 'stopwatch',
  ): Promise<void> => {
    stopTick();
    const pomodoroTask: PomodoroTask = {
      taskId: task.id,
      taskText: task.text,
      filePath: task.filePath,
      taskStart: task.start ?? 0,
    };
    const s: ActiveSession = {
      ...pomodoroTask,
      segmentStartedAt: new Date().toISOString(),
      accumulatedSeconds: 0,
      duration: durationMin.value,
      type,
      paused: false,
    };
    session.value = s;
    sessionType.value = type;
    elapsed.value = 0;
    isPaused.value = false;
    await persistSession(s);
    await persistLastTask(pomodoroTask);
    startTick();
  };

  const pauseSession = async (): Promise<void> => {
    const s = session.value;
    if (!s || isPaused.value) return;
    stopTick();
    const pausedAt = new Date();
    const segSec = segmentElapsedSec(s);
    s.accumulatedSeconds += segSec;
    s.paused = true;
    elapsed.value = s.accumulatedSeconds;
    isPaused.value = true;
    await writeSegmentClock(s, pausedAt);
    await persistSession(s);
  };

  const resumeSession = async (): Promise<void> => {
    const s = session.value;
    if (!s || !isPaused.value) return;
    s.segmentStartedAt = new Date().toISOString();
    s.paused = false;
    isPaused.value = false;
    await persistSession(s);
    startTick();
  };

  const stopSession = async (): Promise<void> => {
    const s = session.value;
    if (!s) return;
    stopTick();
    if (!isPaused.value) await writeSegmentClock(s, new Date());
    await clearPersistedSession();
    resetState();
  };

  const restoreSession = async (): Promise<void> => {
    const raw = await to(kvRepo.value.get)(POMODORO_ACTIVE_SESSION_KEY);
    if (raw.isErr() || !raw.value) return;
    const parseResult = to(JSON.parse)(raw.value);
    if (parseResult.isErr()) {
      await clearPersistedSession();
      return;
    }
    const s = parseResult.value as ActiveSession;

    if (s.paused) {
      session.value = s;
      durationMin.value = s.duration;
      sessionType.value = s.type;
      elapsed.value = s.accumulatedSeconds;
      isPaused.value = true;
      return;
    }

    const totalElapsed = s.accumulatedSeconds + segmentElapsedSec(s);

    if (s.type === 'pomo' && totalElapsed >= s.duration * SECONDS_PER_MINUTE) {
      const remaining = s.duration * SECONDS_PER_MINUTE - s.accumulatedSeconds;
      const segEnd = new Date(new Date(s.segmentStartedAt).getTime() + remaining * 1000);
      await writeSegmentClock(s, segEnd);
      await clearPersistedSession();
      notifyComplete();
      return;
    }

    stopTick();
    session.value = s;
    durationMin.value = s.duration;
    sessionType.value = s.type;
    elapsed.value = totalElapsed;
    isPaused.value = false;
    startTick();
  };

  const loadLastTask = async (): Promise<PomodoroTask | null> => {
    const raw = await to(kvRepo.value.get)(POMODORO_LAST_TASK_KEY);
    if (raw.isErr() || !raw.value) return null;
    const parseResult = to(JSON.parse)(raw.value);
    if (parseResult.isErr()) return null;
    return parseResult.value as PomodoroTask;
  };

  const openTaskCompletion = async (): Promise<(FileTask & { filePath: string }) | null> => {
    const store = useAgendaTasksStore();
    const tasks = store.allFiles.flatMap((file) =>
      (file.tasks ?? [])
        .filter((task) => task.kind !== 'list-checkbox' && task.state !== 'done')
        .map((task) => ({ ...task, filePath: file.filePath.join('/') })),
    );
    const completion = api.core.useCompletion();
    return completion.open({
      type: 'choice',
      placeholder: t(i18nKeys.orgAgendaPomodoroSelectTask),
      itemsGetter: async (search: string) => {
        const filtered = search
          ? tasks.filter((task) => task.text.toLowerCase().includes(search.toLowerCase()))
          : tasks;
        return {
          total: filtered.length,
          result: filtered.map((task) => ({
            icon: 'sym_o_task_alt',
            title: task.text,
            description: task.filePath,
            data: task,
            commandHandler: (tk: typeof task) => completion.close(tk),
          })),
        };
      },
    });
  };

  return {
    session,
    elapsed,
    isPaused,
    durationMin,
    sessionType,
    isRunning,
    hasSession,
    progress,
    displayTime,
    startSession,
    pauseSession,
    resumeSession,
    stopSession,
    restoreSession,
    loadLastTask,
    openTaskCompletion,
    pendingTask,
  };
});
