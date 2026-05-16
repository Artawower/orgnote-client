import { addDays, startOfDay } from 'date-fns';
import { join, type FileMeta, type FileTask } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import { createDirPath } from 'src/utils/create-dir-path';
import { extractOrgTitleFromPath } from 'src/utils/extract-org-title-from-path';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { useAgendaFilterStore } from '../stores/agenda-filter-store';
import { findNextOccurrenceInRange, isOverdue, isToday, isTomorrow } from '../utils/agenda-filters';
import { resolveAgendaConfig } from '../index';
import { orgAgendaManifest } from '../manifest';

export type AgendaFilter = 'overdue' | 'today' | 'tomorrow' | 'next7days' | 'all';

export interface AgendaTaskView extends FileTask {
  viewDate: Date;
}

export interface AgendaTaskGroup {
  fileTitle: string;
  filePath: string;
  tasks: AgendaTaskView[];
}

const todayForAgenda = (now: Date): Date => startOfDay(now);

const filterPredicates: Record<
  Exclude<AgendaFilter, 'all' | 'next7days'>,
  (t: FileTask) => boolean
> = {
  overdue: isOverdue,
  today: isToday,
  tomorrow: isTomorrow,
};

const resolveFileTitle = (file: FileMeta): string => {
  const absolutePath = join('/', ...file.filePath);
  return file.title?.trim() || extractOrgTitleFromPath(absolutePath);
};

const resolveAbsolutePath = (file: FileMeta): string => join('/', ...file.filePath);

const isUnderAgendaPath = (file: FileMeta, agendaFilesPath: string | undefined): boolean => {
  if (!agendaFilesPath) return true;
  const absolute = resolveAbsolutePath(file);
  return absolute === agendaFilesPath || absolute.startsWith(createDirPath(agendaFilesPath));
};

const isNextSevenDaysVisible = (task: FileTask, now: Date): boolean =>
  findNextOccurrenceInRange(task, now, 7) !== undefined || isOverdue(task, now);

const isTaskVisible = (task: FileTask, filter: AgendaFilter, now: Date): boolean => {
  if (filter === 'all') return true;
  if (filter === 'next7days') return isNextSevenDaysVisible(task, now);
  return filterPredicates[filter](task);
};

const computeViewDate = (task: FileTask, filter: AgendaFilter, now: Date): Date => {
  if (filter === 'tomorrow') return addDays(todayForAgenda(now), 1);
  if (filter !== 'next7days') return todayForAgenda(now);
  const viewDate = findNextOccurrenceInRange(task, now, 7);
  return viewDate ?? todayForAgenda(now);
};

const toTaskView = (task: FileTask, filter: AgendaFilter, now: Date): AgendaTaskView => ({
  ...task,
  viewDate: computeViewDate(task, filter, now),
});

const applyFilter = (tasks: FileTask[], filter: AgendaFilter, now: Date): AgendaTaskView[] =>
  tasks
    .filter((task) => isTaskVisible(task, filter, now))
    .map((task) => toTaskView(task, filter, now));

const toGroup = (file: FileMeta, filter: AgendaFilter, now: Date): AgendaTaskGroup | null => {
  const tasks = applyFilter(file.tasks ?? [], filter, now);
  if (!tasks.length) return null;
  return { fileTitle: resolveFileTitle(file), filePath: resolveAbsolutePath(file), tasks };
};

const toGroups = (files: FileMeta[], filter: AgendaFilter, now = new Date()): AgendaTaskGroup[] =>
  files.flatMap((file) => {
    const group = toGroup(file, filter, now);
    return group ? [group] : [];
  });

const countFileTasks = (
  acc: Record<AgendaFilter, number>,
  file: FileMeta,
  now: Date,
): Record<AgendaFilter, number> => {
  const tasks = file.tasks ?? [];
  acc.all += tasks.length;
  acc.overdue += tasks.filter((task) => isOverdue(task, now)).length;
  acc.today += tasks.filter((task) => isToday(task, now)).length;
  acc.tomorrow += tasks.filter((task) => isTomorrow(task, now)).length;
  acc.next7days += tasks.filter((task) => isNextSevenDaysVisible(task, now)).length;
  return acc;
};

const emptyTotals = (): Record<AgendaFilter, number> => ({
  overdue: 0,
  today: 0,
  tomorrow: 0,
  next7days: 0,
  all: 0,
});

const buildTotalsByFilter = (files: FileMeta[], now = new Date()): Record<AgendaFilter, number> =>
  files.reduce((acc, file) => countFileTasks(acc, file, now), emptyTotals());

const setupWatchers = (loadFiles: (silent?: boolean) => Promise<void>): (() => void) => {
  const fileWatcher = api.core.useFileWatcher();
  const fileSearch = api.core.useFileSearch();
  const { isIndexing } = storeToRefs(fileSearch);

  const stopFileWatch = fileWatcher.watch('/', () => loadFiles(true), { recursive: true });
  const stopIndexWatch = watch(isIndexing, (now, was) => {
    if (!now && was) void loadFiles(true);
  });

  return () => {
    stopFileWatch();
    stopIndexWatch();
  };
};

export const useAgendaTasks = () => {
  const fileMeta = api.core.useFileMeta();
  const extensionStore = api.core.useExtensions();

  const allFiles = ref<FileMeta[]>([]);
  const loading = ref(false);
  const filterStore = useAgendaFilterStore();

  const agendaConfig = computed(() =>
    resolveAgendaConfig(extensionStore.getExtensionConfig(orgAgendaManifest.name).value),
  );

  const agendaFiles = computed(() =>
    allFiles.value.filter((f) => isUnderAgendaPath(f, agendaConfig.value.agendaFilesPath)),
  );

  const groups = computed(() => toGroups(agendaFiles.value, filterStore.activeFilter));

  const totalByFilter = computed(() => buildTotalsByFilter(agendaFiles.value));

  const loadFiles = async (silent = false): Promise<void> => {
    if (!silent) loading.value = true;
    const result = await to(() => fileMeta.getAll(), 'Failed to load agenda tasks')();
    if (!silent) loading.value = false;
    if (result.isErr()) {
      reporter.reportError(result.error);
      return;
    }
    allFiles.value = result.value;
  };

  const stopWatchers = setupWatchers(loadFiles);
  onMounted(loadFiles);
  onUnmounted(stopWatchers);

  return {
    loading,
    groups,
    totalByFilter,
    loadFiles,
    silentReload: () => loadFiles(true),
  };
};
