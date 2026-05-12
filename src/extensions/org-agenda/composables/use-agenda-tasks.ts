import { join, type FileMeta, type FileTask } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import { extractOrgTitleFromPath } from 'src/utils/extract-org-title-from-path';
import { storeToRefs } from 'pinia';
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import { isOverdue, isToday, isTomorrow, isNextSevenDays } from '../utils/agenda-filters';
import { resolveAgendaConfig } from '../index';
import { orgAgendaManifest } from '../manifest';

export type AgendaFilter = 'overdue' | 'today' | 'tomorrow' | 'next7days' | 'all';

export interface AgendaTaskGroup {
  fileTitle: string;
  filePath: string;
  tasks: FileTask[];
}

const filterPredicates: Record<Exclude<AgendaFilter, 'all'>, (t: FileTask) => boolean> = {
  overdue: isOverdue,
  today: isToday,
  tomorrow: isTomorrow,
  next7days: isNextSevenDays,
};

const resolveFileTitle = (file: FileMeta): string => {
  const absolutePath = join('/', ...file.filePath);
  return file.title?.trim() || extractOrgTitleFromPath(absolutePath);
};

const resolveAbsolutePath = (file: FileMeta): string => join('/', ...file.filePath);

const normalizeDirPath = (path: string): string => (path.endsWith('/') ? path : `${path}/`);

const isUnderAgendaPath = (file: FileMeta, agendaFilesPath: string | undefined): boolean => {
  if (!agendaFilesPath) return true;
  const absolute = resolveAbsolutePath(file);
  return absolute === agendaFilesPath || absolute.startsWith(normalizeDirPath(agendaFilesPath));
};

const applyFilter = (tasks: FileTask[], filter: AgendaFilter): FileTask[] => {
  if (filter === 'all') return tasks;
  return tasks.filter(filterPredicates[filter]);
};

const toGroup = (file: FileMeta, filter: AgendaFilter): AgendaTaskGroup | null => {
  const tasks = applyFilter(file.tasks ?? [], filter);
  if (!tasks.length) return null;
  return { fileTitle: resolveFileTitle(file), filePath: resolveAbsolutePath(file), tasks };
};

const toGroups = (files: FileMeta[], filter: AgendaFilter): AgendaTaskGroup[] =>
  files.flatMap((f) => {
    const group = toGroup(f, filter);
    return group ? [group] : [];
  });

const countFileTasks = (
  acc: Record<AgendaFilter, number>,
  file: FileMeta,
): Record<AgendaFilter, number> => {
  const tasks = file.tasks ?? [];
  acc.all += tasks.length;
  acc.overdue += tasks.filter((t) => isOverdue(t)).length;
  acc.today += tasks.filter((t) => isToday(t)).length;
  acc.tomorrow += tasks.filter((t) => isTomorrow(t)).length;
  acc.next7days += tasks.filter((t) => isNextSevenDays(t)).length;
  return acc;
};

const emptyTotals = (): Record<AgendaFilter, number> => ({
  overdue: 0,
  today: 0,
  tomorrow: 0,
  next7days: 0,
  all: 0,
});

const buildTotalsByFilter = (files: FileMeta[]): Record<AgendaFilter, number> =>
  files.reduce(countFileTasks, emptyTotals());

const setupWatchers = (loadFiles: () => Promise<void>): (() => void) => {
  const fileWatcher = api.core.useFileWatcher();
  const fileSearch = api.core.useFileSearch();
  const { isIndexing } = storeToRefs(fileSearch);

  const stopFileWatch = fileWatcher.watch('/', loadFiles, { recursive: true });
  const stopIndexWatch = watch(isIndexing, (now, was) => {
    if (!now && was) void loadFiles();
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
  const activeFilter = ref<AgendaFilter>('all');

  const agendaConfig = computed(() =>
    resolveAgendaConfig(extensionStore.getExtensionConfig(orgAgendaManifest.name).value),
  );

  const agendaFiles = computed(() =>
    allFiles.value.filter((f) => isUnderAgendaPath(f, agendaConfig.value.agendaFilesPath)),
  );

  const groups = computed(() => toGroups(agendaFiles.value, activeFilter.value));

  const totalByFilter = computed(() => buildTotalsByFilter(agendaFiles.value));

  let loadInProgress = false;

  const loadFiles = async (): Promise<void> => {
    if (loadInProgress) return;
    loadInProgress = true;
    loading.value = true;
    const result = await to(() => fileMeta.getAll(), 'Failed to load agenda tasks')();
    loading.value = false;
    loadInProgress = false;
    if (result.isErr()) {
      reporter.reportError(result.error);
      return;
    }
    allFiles.value = result.value;
  };

  const stopWatchers = setupWatchers(loadFiles);
  onMounted(loadFiles);
  onUnmounted(stopWatchers);

  return { loading, groups, activeFilter, totalByFilter, loadFiles };
};
