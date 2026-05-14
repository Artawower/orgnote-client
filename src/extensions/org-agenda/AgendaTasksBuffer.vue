<template>
  <container-layout class="agenda-buffer" :body-scroll="true">
    <template #body>
      <loading-dots v-if="loading" />
      <empty-state
        v-else-if="!groups.length"
        icon="sym_o_checklist"
        :title="t(extensionI18nKeys.orgAgendaNoTasksTitle)"
        :description="t(extensionI18nKeys.orgAgendaNoTasksDescription)"
      />
      <app-flex v-else column start align-stretch gap="sm">
        <agenda-task-group
          v-for="group in groups"
          :key="group.filePath"
          :group="group"
          @task-click="openNote"
          @task-toggle="toggleTask"
        />
      </app-flex>
    </template>
  </container-layout>
</template>

<script lang="ts" setup>
import { watch } from 'vue';
import { DefaultCommands } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import AppFlex from 'src/components/AppFlex.vue';
import ContainerLayout from 'src/components/ContainerLayout.vue';
import EmptyState from 'src/components/EmptyState.vue';
import LoadingDots from 'src/components/LoadingDots.vue';
import { api } from 'src/boot/api';
import { logger } from 'src/boot/logger';
import { reporter } from 'src/boot/report';
import AgendaTaskGroup from './components/AgendaTaskGroup.vue';
import { useAgendaTasks } from './composables/use-agenda-tasks';
import type { AgendaTaskView } from './composables/use-agenda-tasks';
import { createFileMutationRunner } from './mutations/file-mutation-runner';
import type { ContentMutator } from './mutations/file-mutation-runner';
import { completeTask } from './mutations/complete-task';
import { completeRepeatingTask } from './mutations/complete-repeating-task';
import { reopenTask } from './mutations/reopen-task';
import { undoRecurringCompletion } from './mutations/undo-recurring-completion';
import { useAgendaFilterStore } from './stores/agenda-filter-store';
import { useI18n } from 'vue-i18n';
import { extensionI18nKeys } from 'src/constants/extension-i18n-keys';
import type { FileTask } from 'orgnote-api';
import { isCompletedOn } from './utils/agenda-filters';

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const { loading, groups, totalByFilter, silentReload } = useAgendaTasks();
const filterStore = useAgendaFilterStore();

watch(totalByFilter, (value) => filterStore.setTotals(value), { immediate: true });

const mutationRunner = createFileMutationRunner({
  fileContent: api.core.useFileContent(),
  fileSearch: api.core.useFileSearch(),
});

const hasRepeater = (task: FileTask): boolean =>
  !!(task.scheduled?.repeater ?? task.deadline?.repeater);

const isSameLocalDay = (left: Date, right: Date): boolean =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const resolveCompletedAt = (viewDate: Date): Date => {
  const now = new Date();
  return isSameLocalDay(viewDate, now) ? now : viewDate;
};

const findDoneDateForView = (task: AgendaTaskView): string | undefined =>
  task.doneDates?.find((doneDate) =>
    isCompletedOn({ ...task, doneDates: [doneDate] }, task.viewDate),
  );

const buildMutation =
  (task: AgendaTaskView): ContentMutator =>
  (content: string): string | undefined => {
    if (task.start === undefined) {
      logger.warn('[agenda] buildMutation: task.start undefined');
      return content;
    }
    const completedAt = resolveCompletedAt(task.viewDate);
    const completedOnViewDate = isCompletedOn(task, task.viewDate);
    const doneDate = findDoneDateForView(task);
    logger.info('[agenda] buildMutation: state check', {
      taskState: task.state,
      hasRepeater: hasRepeater(task),
      lastDoneAt: task.lastDoneAt,
      isCompletedToday: completedOnViewDate,
      now: completedAt.toISOString(),
    });
    if (completedOnViewDate && hasRepeater(task) && doneDate) {
      logger.info('[agenda] buildMutation: branch=undoRecurringCompletion', {
        taskStart: task.start,
        lastDoneAt: doneDate,
      });
      const result = undoRecurringCompletion(content, task.start, doneDate);
      logger.info('[agenda] undoRecurringCompletion returned', {
        defined: result !== undefined,
        sameAsInput: result === content,
      });
      return result;
    }
    if (task.state === 'done') {
      logger.info('[agenda] buildMutation: branch=reopenTask', { taskStart: task.start });
      const result = reopenTask(content, task.start);
      logger.info('[agenda] reopenTask returned', {
        defined: result !== undefined,
        sameAsInput: result === content,
      });
      return result;
    }
    if (hasRepeater(task)) {
      logger.info('[agenda] buildMutation: branch=completeRepeatingTask', {
        taskStart: task.start,
      });
      const result = completeRepeatingTask(content, task.start, completedAt);
      logger.info('[agenda] completeRepeatingTask returned', {
        defined: result !== undefined,
        sameAsInput: result === content,
      });
      return result;
    }
    logger.info('[agenda] buildMutation: branch=completeTask', { taskStart: task.start });
    const result = completeTask(content, task.start, completedAt);
    logger.info('[agenda] completeTask returned', {
      defined: result !== undefined,
      sameAsInput: result === content,
    });
    return result;
  };

const toggleTask = async (task: AgendaTaskView, filePath: string): Promise<void> => {
  logger.info('[agenda] toggleTask called', {
    taskStart: task.start,
    taskState: task.state,
    taskText: task.text,
    hasRepeater: hasRepeater(task),
    filePath,
  });
  if (task.start === undefined) {
    logger.warn('[agenda] toggleTask: task.start is undefined, abort');
    return;
  }
  await mutationRunner.run(filePath, buildMutation(task));
  logger.info('[agenda] toggleTask: mutationRunner.run completed');
  await silentReload();
  logger.info('[agenda] toggleTask: silentReload completed');
};

const openNote = async (_task: FileTask, filePath: string): Promise<void> => {
  const result = await to(() =>
    api.core.useCommands().execute(DefaultCommands.OPEN_NOTE, { path: filePath }),
  )();
  if (result.isErr())
    reporter.reportError(new Error('Failed to open note', { cause: result.error }));
};
</script>

<style lang="scss" scoped>
.agenda-buffer {
  @include fit;
  padding: var(--padding-md);
}
</style>
