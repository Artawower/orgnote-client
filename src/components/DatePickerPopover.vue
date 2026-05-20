<template>
  <app-popover ref="popoverRef" :breakpoint="0">
    <template #default="{ toggle }">
      <slot name="trigger" :open="handleOpen.bind(null, toggle)" />
    </template>
    <template #content>
      <date-picker-sheet :model-value="modelValue" @update:model-value="onUpdate" />
    </template>
  </app-popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import { to } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import AppPopover from 'src/components/AppPopover.vue';
import DatePickerSheet from 'src/components/DatePickerSheet.vue';
import DatePickerSheetModal from 'src/components/DatePickerSheetModal.vue';

type DateSheetResult = { date: string | null } | undefined;

const props = defineProps<{ modelValue?: string }>();

const emit = defineEmits<{ 'update:modelValue': [value: string | undefined] }>();

const popoverRef = ref<InstanceType<typeof AppPopover> | null>(null);
const isOpening = ref(false);
const { desktopBelow } = api.ui.useScreenDetection();

const blurActiveElement = (): void => {
  const activeElement = document.activeElement;
  if (!(activeElement instanceof HTMLElement)) return;
  activeElement.blur();
};

const openMobileSheet = async (): Promise<void> => {
  if (isOpening.value) return;
  isOpening.value = true;
  blurActiveElement();
  const result = await to(() =>
    api.ui.useModal().open<DateSheetResult>(DatePickerSheetModal, {
      mini: true,
      modalProps: { modelValue: props.modelValue },
    }),
  )();
  isOpening.value = false;

  if (result.isErr()) {
    reporter.reportError(result.error);
    return;
  }
  if (!result.value) return;
  emit('update:modelValue', result.value.date ?? undefined);
};

const handleOpen = (toggle: () => void): void => {
  if (desktopBelow.value) {
    void openMobileSheet();
    return;
  }

  toggle();
};

const onUpdate = (value: string | undefined): void => {
  emit('update:modelValue', value);
  popoverRef.value?.close();
};
</script>
