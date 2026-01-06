<template>
  <safe-area bottom>
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
