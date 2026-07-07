import type { Command, FileMeta, FileTask, OrgNoteApi } from 'orgnote-api';
import { textToUint8Array, to, uint8ArrayToText } from 'orgnote-api/utils';
import { i18n } from 'src/boot/i18n';
import { reporter } from 'src/boot/report';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { AGENDA_POMODORO_STOP_COMMAND } from '../constants';
import { completeRepeatingTask } from '../mutations/complete-repeating-task';
import { completeTask } from '../mutations/complete-task';
import { useAgendaTasksStore } from '../stores/agenda-tasks-store';
import { hasRepeater, isCompletedOn } from '../utils/agenda-filters';
import { usePomodoroStore } from '../stores/pomodoro-store';

interface PomodoroSessionSnapshot {
  taskId: string;
  filePath: string;
  taskStart: number;
}

interface SessionTask extends FileTask {
  filePath: string;
}

const t = i18n.global.t;

const createSessionSnapshot = (
  store: ReturnType<typeof usePomodoroStore>,
): PomodoroSessionSnapshot | null => {
  const session = store.session;
  if (!session) return null;
  return {
    taskId: session.taskId,
    filePath: session.filePath,
    taskStart: session.taskStart,
  };
};

const normalizeFilePath = (filePath: string): string => filePath.replace(/^\/+/, '');

const resolveFilePath = (file: FileMeta): string => file.filePath.join('/');

const isSnapshotFile = (filePath: string, snapshot: PomodoroSessionSnapshot): boolean =>
  normalizeFilePath(filePath) === normalizeFilePath(snapshot.filePath);

const isSnapshotTask = (task: FileTask, snapshot: PomodoroSessionSnapshot): boolean =>
  task.id === snapshot.taskId ||
  (task.start !== undefined && task.start === snapshot.taskStart);

const toSessionTasks = (file: FileMeta, snapshot: PomodoroSessionSnapshot): SessionTask[] => {
  const filePath = resolveFilePath(file);
  if (!isSnapshotFile(filePath, snapshot)) return [];
  return (file.tasks ?? []).map((task) => ({ ...task, filePath: snapshot.filePath }));
};

const resolveSessionTask = async (
  snapshot: PomodoroSessionSnapshot,
): Promise<SessionTask | null> => {
  const tasksStore = useAgendaTasksStore();
  await tasksStore.loadFiles(true);
  return (
    tasksStore.allFiles
      .flatMap((file) => toSessionTasks(file, snapshot))
      .find((task) => isSnapshotTask(task, snapshot)) ?? null
  );
};

const confirmTaskCompletion = (api: OrgNoteApi): Promise<boolean> =>
  api.ui.useConfirmationModal().confirm({
    title: t(i18nKeys.orgAgendaPomodoroCompleteTaskTitle),
    message: t(i18nKeys.orgAgendaPomodoroCompleteTaskMessage),
    confirmText: t(i18nKeys.orgAgendaPomodoroCompleteTaskConfirm),
    cancelText: t(i18nKeys.orgAgendaPomodoroCompleteTaskCancel),
  });

const canCompleteStoppedTask = (task: FileTask, completedAt: Date): boolean =>
  task.kind === 'headline-todo' &&
  task.start !== undefined &&
  task.state !== 'done' &&
  !isCompletedOn(task, completedAt);

const completeStoppedTask = (content: string, task: SessionTask, completedAt: Date): string => {
  const start = task.start;
  if (start === undefined || !canCompleteStoppedTask(task, completedAt)) return content;
  if (hasRepeater(task)) return completeRepeatingTask(content, start, completedAt);
  return completeTask(content, start, completedAt);
};

const writeCompletedTask = async (
  api: OrgNoteApi,
  task: SessionTask,
  completedAt: Date,
): Promise<void> => {
  const fileContent = api.core.useFileContent();
  const readResult = await to(fileContent.read, 'Failed to read Pomodoro task file')(task.filePath);
  if (readResult.isErr()) {
    reporter.reportError(readResult.error);
    return;
  }
  const content = uint8ArrayToText(readResult.value);
  const nextContent = to(completeStoppedTask, 'Failed to complete Pomodoro task')(
    content,
    task,
    completedAt,
  );
  if (nextContent.isErr()) {
    reporter.reportError(nextContent.error);
    return;
  }
  if (nextContent.value === content) return;
  const writeResult = await to(fileContent.write, 'Failed to write Pomodoro task file')(
    task.filePath,
    textToUint8Array(nextContent.value),
  );
  if (writeResult.isErr()) reporter.reportError(writeResult.error);
};

const maybeCompleteStoppedTask = async (
  api: OrgNoteApi,
  snapshot: PomodoroSessionSnapshot,
  completedAt: Date,
): Promise<void> => {
  const task = await resolveSessionTask(snapshot);
  if (!task || !canCompleteStoppedTask(task, completedAt)) return;
  const confirmed = await confirmTaskCompletion(api);
  if (!confirmed) return;
  await writeCompletedTask(api, task, completedAt);
};

export const stopPomodoroCommand: Command = {
  command: AGENDA_POMODORO_STOP_COMMAND,
  group: 'agenda',
  icon: 'sym_o_stop',
  handler: async (api: OrgNoteApi) => {
    const store = usePomodoroStore();
    const snapshot = createSessionSnapshot(store);
    const completedAt = new Date();
    await store.stopSession();
    if (!snapshot) return;
    await maybeCompleteStoppedTask(api, snapshot, completedAt);
  },
};
