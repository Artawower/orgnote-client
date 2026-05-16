<template>
  <app-popover ref="popoverRef" :breakpoint="600">
    <template #default="{ toggle }">
      <slot :toggle="toggle" />
    </template>
    <template #content>
      <agenda-date-sheet :model-value="model" @update:model-value="onSheetUpdate" />
    </template>
  </app-popover>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import AppPopover from 'src/components/AppPopover.vue';
import AgendaDateSheet from './AgendaDateSheet.vue';

const model = defineModel<string | undefined>();
const popoverRef = ref<InstanceType<typeof AppPopover> | null>(null);

const onSheetUpdate = (value: string | undefined): void => {
  model.value = value;
  popoverRef.value?.close();
};
</script>
