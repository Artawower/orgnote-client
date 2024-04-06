<template>
  <div class="encryption-error-container">
    <h5 class="text-h5 color-secondary">{{ $t('Sync failed') }}</h5>
    <q-input
      class="fg-main q-mt-md"
      standout="bg-main"
      v-model="(config.encryption as OrgNoteGpgEncryption).privateKeyPassphrase"
      :label="$t('encryption password')"
    />
    <q-card-actions align="right">
      <q-btn
        @click="disableEncryption"
        flat
        :label="$t('disable encryption')"
        color="red"
        v-close-popup
      />
      <q-btn
        @click="applyPasspharese"
        flat
        :label="$t('apply passphrase')"
        color="primary"
        v-close-popup
      />
    </q-card-actions>
  </div>
</template>

<script lang="ts" setup>
import { OrgNoteGpgEncryption } from 'orgnote-api';
import { useEncryptionStore, useModalStore } from 'src/stores';
import { useSettingsStore } from 'src/stores/settings';

const { config } = useSettingsStore();
const { close } = useModalStore();

const disableEncryption = async () => {
  config.encryption = { type: 'disabled' };
};

const encryptionStore = useEncryptionStore();
const applyPasspharese = async () => {
  close();
  await encryptionStore.decryptExistingNotes();
};
</script>

<style lang="scss">
.encryption-error-container {
  padding: var(--block-padding-md);
}
</style>
