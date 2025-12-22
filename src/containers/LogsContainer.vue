<template>
  <safe-area fit>
    <container-layout gap="lg" :body-scroll="false">
      <app-logs />

      <template #footer>
        <card-wrapper>
          <menu-item type="warning" @click="clearLogs">
            {{ $t(I18N.CLEAR_LOGS) }}
          </menu-item>
          <menu-item type="info" @click="safeCopyToClipboard(errorLogText)">
            {{ $t(I18N.COPY_LOG) }}
          </menu-item>
          <command-menu-item :command="DefaultCommands.RESET_SYSTEM" type="danger" disable-icon />
        </card-wrapper>
      </template>
    </container-layout>
  </safe-area>
</template>

<script setup lang="ts">
import ContainerLayout from 'src/components/ContainerLayout.vue';
import AppLogs from 'src/containers/AppLogs.vue';
import { DefaultCommands, I18N } from 'orgnote-api';
import { useAppLogs } from 'src/composables/useAppLogs';
import { api } from 'src/boot/api';
import MenuItem from 'src/containers/MenuItem.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import SafeArea from 'src/components/SafeArea.vue';
import { useInteractiveClipboard } from 'src/composables/use-interactive-clipboard';
import CommandMenuItem from './CommandMenuItem.vue';

const { errorLogText } = useAppLogs();
const { safeCopyToClipboard } = useInteractiveClipboard();

const clearLogs = async () => {
  api.core.useCommands().execute(DefaultCommands.CLEAR_LOGS);
};
</script>
