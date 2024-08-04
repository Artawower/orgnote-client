<template>
  <q-dialog
    v-model="model"
    :position="$q.platform.is.mobile ? 'bottom' : 'standard'"
    @hide="emits('closed')"
  >
    <div class="dialog-content" ref="contentRef">
      <slot />
    </div>
  </q-dialog>
</template>

<script lang="ts" setup>
import { onClickOutside } from '@vueuse/core';
import { ref } from 'vue';

const model = defineModel<boolean>();

const emits = defineEmits<{
  (e: 'closed'): void;
}>();

const contentRef = ref<HTMLElement | null>(null);

onClickOutside(contentRef, () => {
  emits('closed');
});
</script>

<style lang="scss">
.dialog-content {
  box-sizing: border-box;
  /* padding: var(--block-padding-md); */
}

@include mobile {
  .dialog-content {
    padding-bottom: var(--device-padding-bottom);
  }
}

@include desktop {
  .dialog-content {
    background-color: var(--bg);
    min-width: 300px;
  }
}
</style>
