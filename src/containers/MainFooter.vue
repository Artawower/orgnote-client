<template>
  <app-footer>
    <command-action-button size="md" v-for="cmd of toolbarCommands" :key="cmd" :command="cmd" />
  </app-footer>
</template>

<script lang="ts" setup>
import { api } from 'src/boot/api';
import AppFooter from 'src/components/AppFooter.vue';
import CommandActionButton from './CommandActionButton.vue';

const toolbarCommands = api.ui.useToolbar().commands;
</script>
