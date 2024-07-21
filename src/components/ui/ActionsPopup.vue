<template>
  <div class="popup-overlay" ref="menuGroupRef">
    <menu-group @handled="emits('close')" :group-config="popupMenuGroup" />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import MenuGroup, { MenuGroupConfig } from './MenuGroup.vue';
import { onClickOutside } from '@vueuse/core';

defineProps<{
  popupMenuGroup?: MenuGroupConfig;
}>();

const emits = defineEmits<{
  (e: 'close'): void;
}>();

const menuGroupRef = ref(null);

onClickOutside(menuGroupRef, () => {
  emits('close');
});
</script>

<style lang="scss">
.popup-overlay {
  position: fixed;
  bottom: 0;
  width: 100%;
  z-index: 100000;
  background: var(--bg);
  box-sizing: border-box;
}

@include desktop() {
  .popup-overlay {
    top: 50%;
    transform: translateY(-50%), translateX(-50%);
    left: 50%;
    width: auto;
    min-width: 200px;
  }
}
</style>
