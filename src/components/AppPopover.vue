<template>
  <div class="app-popover">
    <slot :toggle="toggle" />
    <q-popup-proxy v-model="isOpen" no-parent-event :breakpoint="breakpoint">
      <slot name="content" />
    </q-popup-proxy>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';

withDefaults(
  defineProps<{
    breakpoint?: number;
  }>(),
  {
    breakpoint: 600,
  },
);

const isOpen = ref(false);

const toggle = (): void => {
  isOpen.value = !isOpen.value;
};

const open = (): void => {
  isOpen.value = true;
};

const close = (): void => {
  isOpen.value = false;
};

defineExpose({ toggle, open, close });
</script>

<style lang="scss" scoped>
.app-popover {
  display: inline-flex;
  position: relative;
}
</style>
