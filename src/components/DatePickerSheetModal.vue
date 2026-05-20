<template>
  <date-picker-sheet :model-value="modelValue" @update:model-value="onUpdate" />
</template>

<script lang="ts" setup>
import { api } from 'src/boot/api';
import DatePickerSheet from './DatePickerSheet.vue';

defineProps<{ modelValue?: string }>();

const modal = api.ui.useModal();

const onUpdate = (date: string | undefined): void => {
  modal.close({ date: date ?? null });
};
</script>
