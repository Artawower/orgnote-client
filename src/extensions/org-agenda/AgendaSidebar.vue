<template>
  <app-flex class="agenda-sidebar" column start align-stretch gap="md">
    <agenda-tasks-filter
      v-model="filterStore.activeFilter"
      :totals="tasksStore.totalByFilter"
      @select="onFilterSelect"
    />
    <agenda-views-nav @navigate="onViewNavigate" />
  </app-flex>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import { to } from 'orgnote-api/utils';
import AppFlex from 'src/components/AppFlex.vue';
import AgendaTasksFilter from './components/AgendaTasksFilter.vue';
import AgendaViewsNav from './components/AgendaViewsNav.vue';
import { useAgendaFilterStore } from './stores/agenda-filter-store';
import { useAgendaTasksStore } from './stores/agenda-tasks-store';
import type { AgendaFilter } from './composables/use-agenda-tasks';
import {
  AGENDA_TASKS_TODAY_COMMAND,
  AGENDA_TASKS_TOMORROW_COMMAND,
  AGENDA_TASKS_NEXT7DAYS_COMMAND,
  AGENDA_TASKS_OVERDUE_COMMAND,
  AGENDA_TASKS_ALL_COMMAND,
} from './constants';

const filterStore = useAgendaFilterStore();
const tasksStore = useAgendaTasksStore();

onMounted(() => {
  void tasksStore.ensureLoaded();
});

const { tabletBelow } = api.ui.useScreenDetection();

const FILTER_COMMAND: Record<AgendaFilter, string> = {
  today: AGENDA_TASKS_TODAY_COMMAND,
  tomorrow: AGENDA_TASKS_TOMORROW_COMMAND,
  next7days: AGENDA_TASKS_NEXT7DAYS_COMMAND,
  overdue: AGENDA_TASKS_OVERDUE_COMMAND,
  all: AGENDA_TASKS_ALL_COMMAND,
};

const onViewNavigate = async (uri: string): Promise<void> => {
  const result = await to(() => api.core.useBufferViewer().open(uri))();
  if (result.isErr()) {
    reporter.reportError(new Error('Failed to open agenda view', { cause: result.error }));
    return;
  }
  if (tabletBelow.value) {
    api.ui.useSidebar().close();
  }
};

const onFilterSelect = async (filter: AgendaFilter): Promise<void> => {
  await api.core.useCommands().execute(FILTER_COMMAND[filter]);
  if (tabletBelow.value) {
    api.ui.useSidebar().close();
  }
};
</script>

<style lang="scss" scoped>
.agenda-sidebar {
  @include fit;
  padding: var(--padding-lg);
  overflow-y: auto;
}
</style>
