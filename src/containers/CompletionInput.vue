<template>
  <div class="completion-input">
    <div class="input">
      <app-icon name="keyboard_arrow_right" size="md"></app-icon>
      <app-input v-model="model" :placeholder="placeholder"></app-input>
    </div>

    <action-button icon="close" size="md"></action-button>
  </div>
</template>

<script lang="ts" setup>
import ActionButton from 'src/components/ActionButton.vue';
import AppIcon from 'src/components/AppIcon.vue';
import AppInput from 'src/components/AppInput.vue';

defineProps<{
  placeholder?: string;
}>();

const model = defineModel<string>();
</script>

<style lang="scss" scoped>
.completion-input {
  @include flexify(row, space-between, center, var(--gap-sm));
}

.input {
  @include flexify(row, flex-start, center, var(--gap-sm));
}
</style>
