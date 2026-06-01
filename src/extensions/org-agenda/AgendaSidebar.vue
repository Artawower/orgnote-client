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
import { to } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import AppFlex from 'src/components/AppFlex.vue';
import AgendaTasksFilter from './components/AgendaTasksFilter.vue';
import AgendaViewsNav from './components/AgendaViewsNav.vue';
import { useAgendaFilterStore } from './stores/agenda-filter-store';
import { useAgendaTasksStore } from './stores/agenda-tasks-store';
import { AGENDA_TASKS_URI } from './constants';
import type { AgendaFilter } from './composables/use-agenda-tasks';

const filterStore = useAgendaFilterStore();
const tasksStore = useAgendaTasksStore();

onMounted(() => {
  void tasksStore.ensureLoaded();
});

const { tabletBelow } = api.ui.useScreenDetection();

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
  filterStore.activeFilter = filter;
  const result = await to(() => api.core.useBufferViewer().open(AGENDA_TASKS_URI))();
  if (result.isErr()) {
    reporter.reportError(new Error('Failed to open agenda tasks', { cause: result.error }));
    return;
  }
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
