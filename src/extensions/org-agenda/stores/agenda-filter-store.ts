import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { AgendaFilter } from '../composables/use-agenda-tasks';

const emptyTotals = (): Record<AgendaFilter, number> => ({
  overdue: 0,
  today: 0,
  tomorrow: 0,
  next7days: 0,
  all: 0,
});

export const useAgendaFilterStore = defineStore('agendaFilter', () => {
  const activeFilter = ref<AgendaFilter>('all');
  const totalByFilter = ref<Record<AgendaFilter, number>>(emptyTotals());

  const setTotals = (totals: Record<AgendaFilter, number>): void => {
    totalByFilter.value = totals;
  };

  return { activeFilter, totalByFilter, setTotals };
});
