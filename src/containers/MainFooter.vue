<template>
  <safe-area class="footer-spacer" />
  <safe-area bottom class="float-area">
    <app-footer :justify="tabletBelow ? 'between' : 'center'" float>
      <command-action-button size="md" v-for="cmd of toolbarCommands" :key="cmd" :command="cmd" />
    </app-footer>
  </safe-area>
</template>

<script lang="ts" setup>
import { api } from 'src/boot/api';
import AppFooter from 'src/components/AppFooter.vue';
import SafeArea from 'src/components/SafeArea.vue';
import CommandActionButton from './CommandActionButton.vue';
import { useScreenDetection } from 'src/composables/use-screen-detection';

const toolbarCommands = api.ui.useToolbar().commands;

const { tabletBelow } = useScreenDetection();
</script>

<style lang="scss" scoped>
.float-area {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}

.footer-spacer {
  height: var(--floating-footer-height);
  flex-shrink: 0;
}
</style>
