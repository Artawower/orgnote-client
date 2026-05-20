<template>
  <div class="date-picker-sheet">
    <app-flex column gap="sm">
      <app-flex row align-end full-width justify="end" class="shortcuts">
        <action-button
          icon="sym_o_today"
          size="md"
          :title="t(i18nKeys.orgAgendaQuickAddToday)"
          @click="onShortcut('today')"
        />
        <action-button
          icon="sym_o_event"
          size="md"
          :title="t(i18nKeys.orgAgendaQuickAddTomorrow)"
          @click="onShortcut('tomorrow')"
        />
        <action-button
          icon="sym_o_date_range"
          size="md"
          :title="t(i18nKeys.orgAgendaQuickAddNextWeek)"
          @click="onShortcut('next7days')"
        />
        <action-button
          icon="sym_o_close"
          size="md"
          :disabled="!modelValue"
          :title="t(i18nKeys.orgAgendaQuickAddNoDate)"
          @click="onClear"
        />
      </app-flex>
      <app-date-picker :model-value="calendarModel" minimal @date-click="onDateClick" />
    </app-flex>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { addDays, format } from 'date-fns';
import { useI18n } from 'vue-i18n';
import AppFlex from 'src/components/AppFlex.vue';
import AppDatePicker from 'src/components/AppDatePicker.vue';
import ActionButton from 'src/components/ActionButton.vue';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { isoToSlashDate, slashToIsoDate } from 'src/utils/org-date';

const props = defineProps<{ modelValue?: string }>();

const emit = defineEmits<{ 'update:modelValue': [value: string | undefined] }>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const toIsoDate = (date: Date): string => format(date, 'yyyy-MM-dd');

const SHORTCUT_OFFSETS: Record<'today' | 'tomorrow' | 'next7days', number> = {
  today: 0,
  tomorrow: 1,
  next7days: 7,
};

const onShortcut = (key: 'today' | 'tomorrow' | 'next7days'): void => {
  emit('update:modelValue', toIsoDate(addDays(new Date(), SHORTCUT_OFFSETS[key])));
};

const onClear = (): void => {
  emit('update:modelValue', undefined);
};

const onDateClick = ({ date }: { date: string }): void => {
  emit('update:modelValue', slashToIsoDate(date));
};

const calendarModel = computed(() =>
  props.modelValue ? isoToSlashDate(props.modelValue) : undefined,
);
</script>

<style lang="scss" scoped>
.date-picker-sheet {
  box-sizing: border-box;
  width: 320px;
  max-width: 100vw;
}
</style>
