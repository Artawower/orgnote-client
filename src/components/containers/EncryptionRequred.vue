<template>
  <template v-if="noteText">
    <div
      v-if="isCurrentNoteEncrypted"
      @click="openSettings"
      class="full-width full-height column-center pointer"
    >
      <q-icon class="color-main" name="sym_o_encrypted" size="12rem" />
      <span class="link">{{ $t('correct decryption key is required') }}</span>
    </div>
    <slot v-else />
  </template>
</template>

<script lang="ts" setup>
import { useKeybindingStore } from 'src/stores/keybindings';
import { DefaultCommands, isGpgEncrypted } from 'orgnote-api';
import { computed } from 'vue';
import { RouteNames } from 'src/router/routes';
import { convertRouterNameToCommand } from 'src/tools/route-name-to-command.tool';

const { executeCommand } = useKeybindingStore();

const props = defineProps<{
  noteText?: string;
}>();

const openSettings = () => {
  executeCommand({
    command: convertRouterNameToCommand(RouteNames.EncryptionSettings),
  });
};

const isCurrentNoteEncrypted = computed(() => isGpgEncrypted(props.noteText));
</script>
