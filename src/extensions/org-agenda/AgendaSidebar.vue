<template>
  <agenda-tasks-filter
    v-model="filterStore.activeFilter"
    :totals="filterStore.totalByFilter"
    :flat="true"
  />
</template>

<script lang="ts" setup>
import AgendaTasksFilter from './components/AgendaTasksFilter.vue';
import { useAgendaFilterStore } from './stores/agenda-filter-store';

const filterStore = useAgendaFilterStore();
</script>
