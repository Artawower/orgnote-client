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
import { textToUint8Array, to, uint8ArrayToText } from 'orgnote-api/utils';
import AppFlex from 'src/components/AppFlex.vue';
import ContainerLayout from 'src/components/ContainerLayout.vue';
import EmptyState from 'src/components/EmptyState.vue';
import LoadingDots from 'src/components/LoadingDots.vue';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import AgendaTaskGroup from './components/AgendaTaskGroup.vue';
import { useAgendaTasks } from './composables/use-agenda-tasks';
import type { AgendaTaskView } from './composables/use-agenda-tasks';
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
const { loading, groups, totalByFilter } = useAgendaTasks();
const filterStore = useAgendaFilterStore();
const fileContent = api.core.useFileContent();

watch(totalByFilter, (value) => filterStore.setTotals(value), { immediate: true });

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

const applyToggle = (task: AgendaTaskView, content: string): string => {
  if (task.start === undefined) return content;
  const completedAt = resolveCompletedAt(task.viewDate);
  const completedOnViewDate = isCompletedOn(task, task.viewDate);
  const doneDate = findDoneDateForView(task);
  if (completedOnViewDate && hasRepeater(task) && doneDate) {
    return undoRecurringCompletion(content, task.start, doneDate);
  }
  if (task.state === 'done') return reopenTask(content, task.start);
  if (hasRepeater(task)) return completeRepeatingTask(content, task.start, completedAt);
  return completeTask(content, task.start, completedAt);
};

const toggleTask = async (task: AgendaTaskView, filePath: string): Promise<void> => {
  if (task.start === undefined) return;
  const readResult = await to(fileContent.read, 'Failed to read file')(filePath);
  if (readResult.isErr()) {
    reporter.reportError(readResult.error);
    return;
  }
  const content = uint8ArrayToText(readResult.value);
  const nextContent = to(applyToggle, 'Failed to apply agenda mutation')(task, content);
  if (nextContent.isErr()) {
    reporter.reportError(nextContent.error);
    return;
  }
  if (nextContent.value === content) return;
  const writeResult = await to(fileContent.write, 'Failed to write file')(
    filePath,
    textToUint8Array(nextContent.value),
  );
  if (writeResult.isErr()) reporter.reportError(writeResult.error);
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
