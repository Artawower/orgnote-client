<template>
  <app-popover ref="popoverRef" :breakpoint="0" @closed="onPopoverClosed">
    <template #default="{ toggle }">
      <slot name="trigger" :open="handleOpen.bind(null, toggle)" />
    </template>
    <template #content>
      <date-picker-sheet
        :model-value="modelValue"
        :confirm-mode="confirmMode"
        :show-shortcuts="showShortcuts"
        @update:model-value="onUpdate"
        @confirm="onConfirm"
      >
        <template v-if="slots.header" #header>
          <slot name="header" />
        </template>
        <template #sections>
          <slot name="sections" />
        </template>
        <template v-if="slots.footer" #footer="slotProps">
          <slot name="footer" v-bind="slotProps" />
        </template>
      </date-picker-sheet>
    </template>
  </app-popover>
</template>

<script lang="ts" setup>
import { defineComponent, h, ref, useSlots, type Slots } from 'vue';
import { to } from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import AppPopover from 'src/components/AppPopover.vue';
import DatePickerSheet from 'src/components/DatePickerSheet.vue';
import DatePickerSheetModal from 'src/components/DatePickerSheetModal.vue';

type DateSheetResult = { date: string | null } | undefined;

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
  closed: [];
}>();

const slots = useSlots();
const popoverRef = ref<InstanceType<typeof AppPopover> | null>(null);
const isOpening = ref(false);
const isClosingWithConfirm = ref(false);
const { desktopBelow } = api.ui.useScreenDetection();

const blurActiveElement = (): void => {
  const activeElement = document.activeElement;
  if (!(activeElement instanceof HTMLElement)) return;
  activeElement.blur();
};

const sheetSlots = (): Pick<Slots, 'header' | 'sections' | 'footer'> => ({
  header: slots.header,
  sections: slots.sections,
  footer: slots.footer,
});

const createMobileSheet = () =>
  defineComponent({
    name: 'DatePickerPopoverMobileSheet',
    setup: () => () =>
      h(
        DatePickerSheetModal,
        {
          modelValue: props.modelValue,
          confirmMode: props.confirmMode,
          showShortcuts: props.showShortcuts,
        },
        sheetSlots(),
      ),
  });

const openMobileSheet = async (): Promise<void> => {
  if (isOpening.value) return;
  isOpening.value = true;
  blurActiveElement();
  const result = await to(() =>
    api.ui.useModal().open<DateSheetResult>(createMobileSheet(), {
      mini: true,
    }),
  )();
  isOpening.value = false;

  if (result.isErr()) {
    reporter.reportError(result.error);
    emit('closed');
    return;
  }
  if (!result.value) {
    emit('closed');
    return;
  }
  const value = result.value.date ?? undefined;
  emit('update:modelValue', value);
  emit('confirm', value);
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
  if (!props.confirmMode) popoverRef.value?.close();
};

const onConfirm = (value: string | undefined): void => {
  isClosingWithConfirm.value = true;
  popoverRef.value?.close();
  emit('confirm', value);
};

const onPopoverClosed = (): void => {
  if (isClosingWithConfirm.value) {
    isClosingWithConfirm.value = false;
    return;
  }
  emit('closed');
};
</script>
