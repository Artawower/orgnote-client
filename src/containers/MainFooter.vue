<template>
  <div v-if="!keyboardOpened" class="floating-footer">
    <app-footer :justify="tabletBelow ? 'between' : 'center'" float>
      <command-action-button size="md" v-for="cmd of toolbarCommands" :key="cmd" :command="cmd" />
    </app-footer>
  </div>
</template>

<script lang="ts" setup>
import { api } from 'src/boot/api';
import AppFooter from 'src/components/AppFooter.vue';
import CommandActionButton from './CommandActionButton.vue';
import { useScreenDetection } from 'src/composables/use-screen-detection';
import { useKeyboardState } from 'src/composables/use-viewport-behavior';

const toolbarCommands = api.ui.usePinnedCommands().getCommands('edit-toolbar');

const { tabletBelow } = useScreenDetection();

const { keyboardOpened } = useKeyboardState();
</script>

<style lang="scss" scoped>
.floating-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
