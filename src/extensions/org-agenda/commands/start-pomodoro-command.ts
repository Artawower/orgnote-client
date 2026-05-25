import type { Command, CommandHandlerParams, FileTask, OrgNoteApi } from 'orgnote-api';
import { AGENDA_POMODORO_START_COMMAND, AGENDA_POMODORO_URI } from '../constants';
import { usePomodoroStore } from '../stores/pomodoro-store';
import { useConfirmationModal } from 'src/composables/use-confirmation-modal';
import { i18n } from 'src/boot/i18n';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';

const t = i18n.global.t;

type PomodoroTaskData = FileTask & { filePath: string };

const isPomodoroTaskData = (data: unknown): data is PomodoroTaskData =>
  !!data &&
  typeof data === 'object' &&
  typeof (data as PomodoroTaskData).id === 'string' &&
  typeof (data as PomodoroTaskData).filePath === 'string';

const resolveTask = async (data: unknown): Promise<PomodoroTaskData | null> => {
  if (isPomodoroTaskData(data)) return data;
  const store = usePomodoroStore();
  if (isPomodoroTaskData(store.pendingTask)) {
    const task = store.pendingTask;
    store.pendingTask = null;
    return task;
  }
  return store.openTaskCompletion();
};

const handleStartPomodoro = async (
  api: OrgNoteApi,
  params: CommandHandlerParams,
): Promise<void> => {
  const store = usePomodoroStore();
  const { confirm } = useConfirmationModal();

  const task = await resolveTask(params.data);
  if (!task) return;

  if (store.hasSession) {
    const confirmed = await confirm({
      title: t(i18nKeys.orgAgendaPomodoroReplaceTitle),
      message: t(i18nKeys.orgAgendaPomodoroReplaceMessage),
    });
    if (!confirmed) return;
    await store.stopSession();
  }

  await api.core.useBufferViewer().open(AGENDA_POMODORO_URI);
  await store.startSession(task, store.sessionType);
};

export const startPomodoroCommand: Command = {
  command: AGENDA_POMODORO_START_COMMAND,
  group: 'agenda',
  icon: 'sym_o_timer',
  handler: handleStartPomodoro,
};
