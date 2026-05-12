<template>
  <component :is="flat ? 'div' : CardWrapper">
    <menu-item
      v-for="filter in filters"
      :key="filter.id"
      :selected="modelValue === filter.id"
      :active="modelValue === filter.id"
      @click="$emit('update:modelValue', filter.id)"
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
  </component>
</template>

<script lang="ts" setup>
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from 'src/containers/MenuItem.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppIcon from 'src/components/AppIcon.vue';
import AppBadge from 'src/components/AppBadge.vue';
import { extensionI18nKeys } from 'src/constants/extension-i18n-keys';
import type { AgendaFilter } from '../composables/use-agenda-tasks';

defineProps<{
  modelValue: AgendaFilter;
  totals: Record<AgendaFilter, number>;
  flat?: boolean;
}>();

defineEmits<{ 'update:modelValue': [filter: AgendaFilter] }>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const filters = computed(() => [
  {
    id: 'overdue' as AgendaFilter,
    label: t(extensionI18nKeys.orgAgendaFilterOverdue),
    icon: 'sym_o_running_with_errors',
  },
  {
    id: 'today' as AgendaFilter,
    label: t(extensionI18nKeys.orgAgendaFilterToday),
    icon: 'sym_o_today',
  },
  {
    id: 'tomorrow' as AgendaFilter,
    label: t(extensionI18nKeys.orgAgendaFilterTomorrow),
    icon: 'sym_o_wb_sunny',
  },
  {
    id: 'next7days' as AgendaFilter,
    label: t(extensionI18nKeys.orgAgendaFilterNext7Days),
    icon: 'sym_o_date_range',
  },
  {
    id: 'all' as AgendaFilter,
    label: t(extensionI18nKeys.orgAgendaFilterAll),
    icon: 'sym_o_checklist',
  },
]);
</script>
