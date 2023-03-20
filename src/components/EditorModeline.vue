<template>
  <div class="modeline">
    <div class="meta-info">
      <div v-if="cursorPosition != null" class="cursor-position">
        {{ cursorPosition }}
      </div>
    </div>
    <div class="actions">
      <q-btn
        @click="changePreviewMode"
        padding="sm"
        :icon="isPreviewMode ? 'edit_note' : 'preview'"
      ></q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, toRef } from 'vue';

const emit = defineEmits<{
  (e: 'previewModeChanged', mode: boolean): void;
}>();

const props = defineProps<{
  cursorPosition: number;
  previewMode: boolean;
}>();

const cursorPosition = toRef(props, 'cursorPosition');
const isPreviewMode = computed(() => props.previewMode);
const changePreviewMode = () => {
  emit('previewModeChanged', !isPreviewMode.value);
};
</script>

<style lang="scss">
.modeline {
  @include flexify();
  position: fixed;
  width: 100%;
  bottom: 0;
  height: 62px;
  padding: 24px;
}
</style>
