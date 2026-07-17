<template>
  <app-flex column align-stretch gap="md" class="date-range-picker-modal">
    <app-flex center>
      <app-segmented-control v-model="mode" :options="modeOptions" size="sm" />
    </app-flex>

    <app-date-picker v-if="mode === 'day'" v-model="daySelection" mode="single" />
    <app-date-picker v-else v-model="rangeSelection" mode="range" />

    <app-flex row between align-center gap="sm" class="actions">
      <app-button class="clear" size="sm" @click="emit('clear')">
        {{ t(i18nKeys.orgAgendaDateFilterClear) }}
      </app-button>
      <app-flex row end align-center gap="sm">
        <app-button class="cancel" size="sm" @click="emit('cancel')">
          {{ t(i18nKeys.orgAgendaDateFilterCancel) }}
        </app-button>
        <app-button class="apply" type="active" size="sm" :disabled="!canApply" @click="apply">
          {{ t(i18nKeys.orgAgendaDateFilterApply) }}
        </app-button>
      </app-flex>
    </app-flex>
  </app-flex>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import AppButton from 'src/components/AppButton.vue';
import AppDatePicker from 'src/components/AppDatePicker.vue';
import AppFlex from 'src/components/AppFlex.vue';
import AppSegmentedControl from 'src/components/AppSegmentedControl.vue';
import type { SegmentOption } from 'src/components/app-segmented-control.types';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import type { DateRange } from 'src/models/date-picker';
import { isoToSlashDate, slashToIsoDate } from 'src/utils/org-date';

type SelectionMode = 'day' | 'range';

const props = defineProps<{ from: string; to: string }>();
const emit = defineEmits<{
  apply: [range: Readonly<DateRange>];
  clear: [];
  cancel: [];
}>();
const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const initialMode: SelectionMode = props.from === props.to ? 'day' : 'range';
const mode = ref<SelectionMode>(initialMode);
const daySelection = ref(isoToSlashDate(props.from));
const rangeSelection = ref<DateRange | undefined>({
  from: isoToSlashDate(props.from),
  to: isoToSlashDate(props.to),
});
const canApply = computed(() =>
  mode.value === 'day' ? !!daySelection.value : !!rangeSelection.value,
);
const modeOptions = computed<SegmentOption<SelectionMode>[]>(() => [
  { value: 'day', label: t(i18nKeys.orgAgendaDateFilterDay) },
  { value: 'range', label: t(i18nKeys.orgAgendaDateFilterRange) },
]);

watch(mode, (nextMode) => {
  if (nextMode === 'range') {
    rangeSelection.value = { from: daySelection.value, to: daySelection.value };
    return;
  }
  if (rangeSelection.value) daySelection.value = rangeSelection.value.from;
});

const apply = (): void => {
  if (mode.value === 'day') {
    const date = slashToIsoDate(daySelection.value);
    emit('apply', { from: date, to: date });
    return;
  }
  const range = rangeSelection.value;
  if (!range) return;
  emit('apply', {
    from: slashToIsoDate(range.from),
    to: slashToIsoDate(range.to),
  });
};
</script>

<style scoped lang="scss">
.date-range-picker-modal {
  padding: var(--padding-md);
}

.actions {
  border-top: var(--border-default);
  padding-top: var(--padding-sm);
}
</style>
