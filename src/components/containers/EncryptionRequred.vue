<template>
  <template v-if="note">
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
import { DefaultCommands, Note, isGpgEncrypted } from 'orgnote-api';
import { computed } from 'vue';

const { executeCommand } = useKeybindingStore();

const props = defineProps<{
  note?: Note;
}>();

const openSettings = () => {
  executeCommand({ command: DefaultCommands.SETTINGS });
};

const isCurrentNoteEncrypted = computed(() =>
  isGpgEncrypted(props.note.content)
);
</script>
