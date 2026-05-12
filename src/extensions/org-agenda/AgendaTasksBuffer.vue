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
import { onMounted, onUnmounted, watch } from 'vue';
import { DefaultCommands } from 'orgnote-api';
import { to } from 'orgnote-api/utils';
import AppFlex from 'src/components/AppFlex.vue';
import ContainerLayout from 'src/components/ContainerLayout.vue';
import EmptyState from 'src/components/EmptyState.vue';
import LoadingDots from 'src/components/LoadingDots.vue';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import AgendaTaskGroup from './components/AgendaTaskGroup.vue';
import { useAgendaTasks } from './composables/use-agenda-tasks';
import { createFileMutationRunner } from './mutations/file-mutation-runner';
import type { ContentMutator } from './mutations/file-mutation-runner';
import { completeTask } from './mutations/complete-task';
import { completeRepeatingTask } from './mutations/complete-repeating-task';
import { reopenTask } from './mutations/reopen-task';
import { useAgendaFilterStore } from './stores/agenda-filter-store';
import AgendaSidebar from './AgendaSidebar.vue';
import { useI18n } from 'vue-i18n';
import { extensionI18nKeys } from 'src/constants/extension-i18n-keys';
import type { ComponentConfig, VueComponent } from 'orgnote-api';
import type { FileTask } from 'orgnote-api';

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const { loading, groups, totalByFilter, silentReload } = useAgendaTasks();
const filterStore = useAgendaFilterStore();

const sidebar = api.ui.useSidebar();

let savedComponent: VueComponent | undefined;
let savedConfig: ComponentConfig<VueComponent> | undefined;
let wasOpened = false;

const isAgendaSidebarActive = (): boolean => sidebar.component.value === AgendaSidebar;

onMounted(() => {
  savedComponent = sidebar.component.value;
  savedConfig = sidebar.componentConfig.value;
  wasOpened = sidebar.opened.value;
  sidebar.openComponent(AgendaSidebar);
});

onUnmounted(() => {
  if (!isAgendaSidebarActive()) return;
  if (savedComponent) {
    sidebar.openComponent(savedComponent, savedConfig);
    if (!wasOpened) sidebar.close();
    return;
  }
  sidebar.close();
});

watch(totalByFilter, (value) => filterStore.setTotals(value), { immediate: true });

const mutationRunner = createFileMutationRunner({
  fileContent: api.core.useFileContent(),
  fileSearch: api.core.useFileSearch(),
});

const hasRepeater = (task: FileTask): boolean =>
  !!(task.scheduled?.repeater ?? task.deadline?.repeater);

const buildMutation = (task: FileTask, completedAt: Date): ContentMutator =>
  (content: string): string | undefined => {
    if (task.start === undefined) return content;
    if (task.state === 'done') return reopenTask(content, task.start);
    if (hasRepeater(task)) return completeRepeatingTask(content, task.start, completedAt);
    return completeTask(content, task.start, completedAt);
  };

const toggleTask = async (task: FileTask, filePath: string): Promise<void> => {
  if (task.start === undefined) return;
  await mutationRunner.run(filePath, buildMutation(task, new Date()));
  await silentReload();
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
