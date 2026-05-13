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
import { api } from 'src/boot/api';
import AppFlex from 'src/components/AppFlex.vue';
import AgendaTasksFilter from './components/AgendaTasksFilter.vue';
import { useAgendaFilterStore } from './stores/agenda-filter-store';
import { AGENDA_TASKS_URI } from './constants';
import type { AgendaFilter } from './composables/use-agenda-tasks';

const filterStore = useAgendaFilterStore();

const onFilterSelect = (filter: AgendaFilter): void => {
  filterStore.activeFilter = filter;
  api.core.useBufferViewer().open(AGENDA_TASKS_URI);
};
</script>

<style lang="scss" scoped>
.agenda-sidebar {
  @include fit;
  padding: var(--padding-lg);
  overflow-y: auto;
}
</style>
