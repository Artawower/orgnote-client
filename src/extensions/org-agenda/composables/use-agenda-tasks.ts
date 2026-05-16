import { addDays, startOfDay } from 'date-fns';
import { join, type FileMeta, type FileTask } from 'orgnote-api';
import { storeToRefs } from 'pinia';
import { computed, onMounted } from 'vue';
import { extractOrgTitleFromPath } from 'src/utils/extract-org-title-from-path';
import { useAgendaFilterStore } from '../stores/agenda-filter-store';
import { useAgendaTasksStore } from '../stores/agenda-tasks-store';
import { findNextOccurrenceInRange, isOverdue, isToday, isTomorrow } from '../utils/agenda-filters';

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

export const isAgendaEligible = (task: FileTask): boolean =>
  task.kind === 'headline-checkbox' || task.kind === 'headline-todo';

const eligibleTasks = (file: FileMeta): FileTask[] => (file.tasks ?? []).filter(isAgendaEligible);

const applyFilter = (tasks: FileTask[], filter: AgendaFilter, now: Date): AgendaTaskView[] =>
  tasks
    .filter((task) => isTaskVisible(task, filter, now))
    .map((task) => toTaskView(task, filter, now));

const toGroup = (file: FileMeta, filter: AgendaFilter, now: Date): AgendaTaskGroup | null => {
  const tasks = applyFilter(eligibleTasks(file), filter, now);
  if (!tasks.length) return null;
  return { fileTitle: resolveFileTitle(file), filePath: resolveAbsolutePath(file), tasks };
};

const toGroups = (files: FileMeta[], filter: AgendaFilter, now = new Date()): AgendaTaskGroup[] =>
  files.flatMap((file) => {
    const group = toGroup(file, filter, now);
    return group ? [group] : [];
  });

export const useAgendaTasks = () => {
  const tasksStore = useAgendaTasksStore();
  const filterStore = useAgendaFilterStore();
  const { agendaFiles, loading, totalByFilter } = storeToRefs(tasksStore);

  const groups = computed(() => toGroups(agendaFiles.value, filterStore.activeFilter));

  onMounted(() => {
    void tasksStore.ensureLoaded();
  });

  return { loading, groups, totalByFilter };
};
