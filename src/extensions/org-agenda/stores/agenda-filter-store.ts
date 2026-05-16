import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AgendaFilter } from '../composables/use-agenda-tasks';

export const useAgendaFilterStore = defineStore('agendaFilter', () => {
  const activeFilter = ref<AgendaFilter>('all');
  return { activeFilter };
});
