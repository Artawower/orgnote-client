<template>
  <date-picker-sheet
    :model-value="modelValue"
    :confirm-mode="confirmMode"
    :show-shortcuts="showShortcuts"
    @update:model-value="onUpdate"
    @confirm="onConfirm"
  >
    <template #header>
      <slot name="header" />
    </template>
    <template #sections>
      <slot name="sections" />
    </template>
    <template #footer="slotProps">
      <slot name="footer" v-bind="slotProps" />
    </template>
  </date-picker-sheet>
</template>

<script lang="ts" setup>
import { api } from 'src/boot/api';
import DatePickerSheet from './DatePickerSheet.vue';

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

const modal = api.ui.useModal();

const closeWithDate = (date: string | undefined): void => {
  modal.close({ date: date ?? null });
};

const onUpdate = (date: string | undefined): void => {
  if (props.confirmMode) return;
  closeWithDate(date);
};

const onConfirm = (date: string | undefined): void => {
  closeWithDate(date);
};
</script>
