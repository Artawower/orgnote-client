<template>
  <app-flex class="completion-input" row between align-center>
    <app-flex class="input" row start align-center>
      <app-icon name="keyboard_arrow_right" size="md" color="fg"></app-icon>
      <app-input
        ref="appInputRef"
        @keypress.enter="handleCompletionInput"
        v-model="completion.activeCompletion!.searchQuery"
        :placeholder="placeholder"
      ></app-input>
    </app-flex>

    <visibility-wrapper desktop-above>
      <action-button
        @click="toggleFullScreen"
        :icon="config?.fullScreen ? 'sym_o_close_fullscreen' : 'open_in_full'"
        size="sm"
      ></action-button>
    </visibility-wrapper>
    <action-button @click="completion.close()" icon="close" size="md"></action-button>
  </app-flex>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import ActionButton from 'src/components/ActionButton.vue';
import AppIcon from 'src/components/AppIcon.vue';
import AppInput from 'src/components/AppInput.vue';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';
import { ref } from 'vue';
import AppFlex from 'src/components/AppFlex.vue';

defineProps<{
  placeholder?: string;
  fullScreen?: boolean;
}>();

const completion = api.core.useCompletion();

const modal = api.ui.useModal();
const { config } = storeToRefs(modal);
const toggleFullScreen = () => {
  modal.updateConfig({
    fullScreen: !config.value?.fullScreen,
  });
};

const handleCompletionInput = () => {
  const activeCompletion = completion.activeCompletion!;
  const selectedIndex = activeCompletion.selectedCandidateIndex ?? 0;
  const selectedCandidate = activeCompletion.candidates?.[selectedIndex];

  if (activeCompletion.type === 'choice' && selectedCandidate) {
    selectedCandidate.commandHandler?.(selectedCandidate.data);
    return;
  }

  if (activeCompletion.type === 'input-choice' || activeCompletion.type === 'input') {
    completion.close(activeCompletion.searchQuery);
    return;
  }
};

const appInputRef = ref<InstanceType<typeof AppInput> | null>(null);

const focusInput = () => {
  appInputRef.value?.focus?.();
};

defineExpose({
  focusInput,
});
</script>

<style lang="scss" scoped>
.completion-input {
}

.input {
  & {
    width: 100%;
  }
}
</style>
