<template>
  <div class="completion-input">
    <div class="input">
      <app-icon name="keyboard_arrow_right" size="md"></app-icon>
      <app-input v-model="activeCompletion.searchQuery" :placeholder="placeholder"></app-input>
    </div>

    <visibility-wrapper desktop-above>
      <action-button
        @click="toggleFullScreen"
        :icon="config.fullScreen ? 'sym_o_close_fullscreen' : 'open_in_full'"
        size="sm"
      ></action-button>
    </visibility-wrapper>
    <action-button @click="completion.close()" icon="close" size="sm"></action-button>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import ActionButton from 'src/components/ActionButton.vue';
import AppIcon from 'src/components/AppIcon.vue';
import AppInput from 'src/components/AppInput.vue';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';

defineProps<{
  placeholder?: string;
  fullScreen?: boolean;
}>();

const completion = api.core.useCompletion();
const { activeCompletion } = storeToRefs(completion);

const modal = api.ui.useModal();
const { config } = storeToRefs(modal);
const toggleFullScreen = () => {
  modal.updateConfig({
    fullScreen: !config.value.fullScreen,
  });
};
</script>

<style lang="scss" scoped>
.completion-input {
  @include flexify(row, space-between, center, var(--gap-sm));
}

.input {
  @include flexify(row, flex-start, center, var(--gap-sm));
  width: 100%;
}
</style>
