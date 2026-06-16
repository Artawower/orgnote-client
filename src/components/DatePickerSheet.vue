<template>
  <div
    v-swipe-stop
    class="date-picker-sheet"
    @swipe-left="datePickerRef?.navigateMonth(1)"
    @swipe-right="datePickerRef?.navigateMonth(-1)"
  >
    <app-flex column gap="sm" class="sheet-content">
      <slot name="header" />
      <app-flex
        v-if="showShortcuts"
        row
        align-center
        full-width
        justify="end"
        gap="xs"
        class="shortcuts"
      >
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
          :disabled="!selectedValue"
          :title="t(i18nKeys.orgAgendaQuickAddNoDate)"
          @click="onClear"
        />
      </app-flex>
      <app-date-picker
        ref="datePickerRef"
        :model-value="calendarModel"
        minimal
        @date-click="onDateClick"
      />
      <slot name="sections" />
      <slot name="footer" :confirm="confirm" :clear="onClear" :value="selectedValue">
        <app-flex v-if="confirmMode" row between align-center full-width gap="sm" class="footer">
          <app-button type="plain" size="sm" class="footer-button" @click="onClear">
            {{ t(i18nKeys.orgAgendaScheduleClear) }}
          </app-button>
          <app-button type="active" size="sm" class="footer-button" @click="confirm">
            {{ t(i18nKeys.orgAgendaScheduleOk) }}
          </app-button>
        </app-flex>
      </slot>
    </app-flex>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from 'vue';
import { addDays, format } from 'date-fns';
import { useI18n } from 'vue-i18n';
import AppFlex from 'src/components/AppFlex.vue';
import AppDatePicker from 'src/components/AppDatePicker.vue';
import ActionButton from 'src/components/ActionButton.vue';
import AppButton from 'src/components/AppButton.vue';
import { extensionI18nKeys as i18nKeys } from 'src/constants/extension-i18n-keys';
import { isoToSlashDate, slashToIsoDate } from 'src/utils/org-date';

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    confirmMode?: boolean;
    showShortcuts?: boolean;
  }>(),
  {
    confirmMode: false,
    showShortcuts: true,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined];
  confirm: [value: string | undefined];
}>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const datePickerRef = ref<InstanceType<typeof AppDatePicker> | null>(null);
const draftValue = ref<string | undefined>(props.modelValue);

const selectedValue = computed(() => (props.confirmMode ? draftValue.value : props.modelValue));

watch(
  () => props.modelValue,
  (value) => {
    draftValue.value = value;
  },
);

const toIsoDate = (date: Date): string => format(date, 'yyyy-MM-dd');

const SHORTCUT_OFFSETS: Record<'today' | 'tomorrow' | 'next7days', number> = {
  today: 0,
  tomorrow: 1,
  next7days: 7,
};

const updateValue = (value: string | undefined): void => {
  if (props.confirmMode) {
    draftValue.value = value;
    return;
  }
  emit('update:modelValue', value);
};

const onShortcut = (key: 'today' | 'tomorrow' | 'next7days'): void => {
  updateValue(toIsoDate(addDays(new Date(), SHORTCUT_OFFSETS[key])));
};

const onClear = (): void => {
  updateValue(undefined);
};

const confirm = (): void => {
  emit('update:modelValue', draftValue.value);
  emit('confirm', draftValue.value);
};

const onDateClick = ({ date }: { date: string }): void => {
  updateValue(slashToIsoDate(date));
};

const calendarModel = computed(() =>
  selectedValue.value ? isoToSlashDate(selectedValue.value) : undefined,
);
</script>

<style lang="scss" scoped>
.date-picker-sheet {
  box-sizing: border-box;
  width: var(--date-picker-sheet-width, 320px);
  max-width: 100vw;
  padding: var(--padding-md);
}

.sheet-content {
  width: 100%;
}

.shortcuts {
  padding: 0;
}

.footer {
  padding-top: var(--padding-sm);
  border-top: var(--border-default);
}

.footer-button {
  flex: 1;
}
</style>
