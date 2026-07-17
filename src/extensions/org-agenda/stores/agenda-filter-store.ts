import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AgendaDateFilter, AgendaFilter } from '../models/agenda-task-query';

const createPresetFilter = (value: AgendaFilter): AgendaDateFilter => ({ kind: 'preset', value });

export const useAgendaFilterStore = defineStore('agendaFilter', () => {
  const searchQuery = ref('');
  const dateFilter = ref<AgendaDateFilter>(createPresetFilter('all'));

  const activePreset = computed<AgendaFilter | undefined>(() =>
    dateFilter.value.kind === 'preset' ? dateFilter.value.value : undefined,
  );

  const setPresetFilter = (filter: AgendaFilter): void => {
    dateFilter.value = createPresetFilter(filter);
  };

  const setDateRange = (firstDate: string, secondDate: string): void => {
    const [from, to] = firstDate <= secondDate ? [firstDate, secondDate] : [secondDate, firstDate];
    dateFilter.value = { kind: 'range', from, to };
  };

  const clearDateFilter = (): void => setPresetFilter('all');

  return {
    searchQuery,
    dateFilter,
    activePreset,
    setPresetFilter,
    setDateRange,
    clearDateFilter,
  };
});
