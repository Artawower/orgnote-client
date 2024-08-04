<template>
  <system-dialog v-model="model" ref="menuGroupRef">
    <div class="popup-overlay">
      <menu-group @handled="emits('close')" v-bind="popupMenuGroup" />
    </div>
  </system-dialog>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import MenuGroup, { MenuGroupProps } from './MenuGroup.vue';
import { onClickOutside } from '@vueuse/core';
import SystemDialog from './SystemDialog.vue';

defineProps<{
  popupMenuGroup?: MenuGroupProps;
}>();

const emits = defineEmits<{
  (e: 'close'): void;
}>();

const menuGroupRef = ref(null);

const model = defineModel<boolean>();

onClickOutside(menuGroupRef, () => {
  model.value = false;
  emits('close');
});
</script>

<style lang="scss">
.popup-overlay {
  padding: var(--block-margin-md);
}
</style>
