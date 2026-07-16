<template>
  <menu-group>
    <menu-item
      v-for="filter in filters"
      :key="filter.id"
      :active="isTasksBufferActive && modelValue === filter.id"
      @click="onFilterClick(filter.id)"
    >
      <app-flex row start align-center gap="sm">
        <app-icon :name="filter.icon" size="sm" />
        <span>{{ filter.label }}</span>
      </app-flex>
      <template #right>
        <app-badge
          v-if="totals[filter.id]"
          :label="String(totals[filter.id])"
          size="xs"
          :variant="filter.id === 'overdue' ? 'danger' : 'plain'"
        />
      </template>
    </menu-item>
  </menu-group>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import MenuGroup from 'src/components/MenuGroup.vue';
import MenuItem from 'src/containers/MenuItem.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppIcon from 'src/components/AppIcon.vue';
import AppBadge from 'src/components/AppBadge.vue';
import { extensionI18nKeys } from 'src/constants/extension-i18n-keys';
import { api } from 'src/boot/api';
import { AGENDA_TASKS_URI } from '../constants';
import type { AgendaFilter } from '../composables/use-agenda-tasks';

defineProps<{
  modelValue: AgendaFilter;
  totals: Record<AgendaFilter, number>;
}>();

const emit = defineEmits<{
  'update:modelValue': [filter: AgendaFilter];
  select: [filter: AgendaFilter];
}>();

const onFilterClick = (filter: AgendaFilter): void => {
  emit('update:modelValue', filter);
  emit('select', filter);
};

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const { activeBufferUri } = storeToRefs(api.core.usePane());
const isTasksBufferActive = computed(() => activeBufferUri.value === AGENDA_TASKS_URI);

type AgendaFilterOption = { id: AgendaFilter; label: string; icon: string };

const filters = computed(
  () =>
    [
      {
        id: 'overdue',
        label: t(extensionI18nKeys.orgAgendaFilterOverdue),
        icon: 'sym_o_running_with_errors',
      },
      {
        id: 'today',
        label: t(extensionI18nKeys.orgAgendaFilterToday),
        icon: 'sym_o_today',
      },
      {
        id: 'tomorrow',
        label: t(extensionI18nKeys.orgAgendaFilterTomorrow),
        icon: 'sym_o_wb_sunny',
      },
      {
        id: 'next7days',
        label: t(extensionI18nKeys.orgAgendaFilterNext7Days),
        icon: 'sym_o_date_range',
      },
      {
        id: 'all',
        label: t(extensionI18nKeys.orgAgendaFilterAll),
        icon: 'sym_o_checklist',
      },
    ] satisfies ReadonlyArray<AgendaFilterOption>,
);
</script>
