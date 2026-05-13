<template>
  <app-flex class="agenda-sidebar" column start align-stretch gap="md">
    <agenda-tasks-filter
      v-model="filterStore.activeFilter"
      :totals="filterStore.totalByFilter"
      @select="onFilterSelect"
    />
  </app-flex>
</template>

<script lang="ts" setup>
import { to } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import AppFlex from 'src/components/AppFlex.vue';
import AgendaTasksFilter from './components/AgendaTasksFilter.vue';
import { useAgendaFilterStore } from './stores/agenda-filter-store';
import { AGENDA_TASKS_URI } from './constants';
import type { AgendaFilter } from './composables/use-agenda-tasks';

const filterStore = useAgendaFilterStore();

const onFilterSelect = async (filter: AgendaFilter): Promise<void> => {
  filterStore.activeFilter = filter;
  const result = await to(() => api.core.useBufferViewer().open(AGENDA_TASKS_URI))();
  if (result.isErr()) {
    reporter.reportError(new Error('Failed to open agenda tasks', { cause: result.error }));
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
