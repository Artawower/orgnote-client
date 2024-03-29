<template>
  <h4 class="text-h5 q-pb-lg text-capitalize">
    {{ $t('encryption settings') }}
  </h4>

  <div class="full-width">
    <q-select
      standout="bg-main"
      v-model="config.encryption.type"
      :options="encryptionOptions"
      label="Encryption type"
      emit-value
      map-options
    >
    </q-select>
  </div>

  <template v-if="config.encryption.type === 'password'">
    <q-input
      class="fg-main q-mt-md"
      standout="bg-main"
      v-model="config.encryption.password"
      :label="$t('encryption password')"
    />
  </template>
  <template v-else-if="config.encryption.type === 'gpg'">
    <q-input
      class="q-mt-md"
      :label="$t('GPG public key')"
      standout="bg-main"
      v-model="config.encryption.publicKey"
      type="textarea"
    ></q-input>

    <q-input
      class="q-mt-md"
      :label="$t('GPG private key')"
      standout="bg-main color-main"
      v-model="config.encryption.privateKey"
      type="textarea"
    ></q-input>

    <q-input
      :label="$t('private key passphrase (optional)')"
      class="q-mt-md"
      standout="bg-main"
      v-model="config.encryption.privateKeyPassphrase"
    >
    </q-input>
  </template>
  <q-btn
    v-if="config.encryption.type !== 'disabled'"
    @click="encryptExistingNotes"
    flat
    color="black"
    class="full-width q-mt-md"
    :label="$t('encrypt and sync existing notes')"
  />
</template>

<script lang="ts" setup>
import {
  OrgNoteEncryption,
  OrgNoteGpgEncryption,
  OrgNotePasswordEncryption,
} from 'orgnote-api';
import { useEncryptionStore } from 'src/stores/encryption.store';
import { useSettingsStore } from 'src/stores/settings';
import { watch } from 'vue';

const { config } = useSettingsStore();

const encryptionOptions: { label: string; value: OrgNoteEncryption['type'] }[] =
  [
    { label: 'Disabled', value: 'disabled' },
    { label: 'GPG', value: 'gpg' },
    { label: 'Password', value: 'password' },
  ];

// TODO: master ask to encrypt everything to the server side.

const encryptionStore = useEncryptionStore();
const encryptExistingNotes = async () => {
  encryptionStore.decryptExistingNotes();
};

watch(
  () => config.encryption.type,
  () => {
    if (
      config.encryption.type === 'disabled' ||
      config.encryption.type === 'password'
    ) {
      delete (config.encryption as unknown as OrgNoteGpgEncryption).privateKey;
      delete (config.encryption as unknown as OrgNoteGpgEncryption).publicKey;
    }
    if (
      config.encryption.type === 'disabled' ||
      config.encryption.type === 'gpg'
    ) {
      delete (config.encryption as unknown as OrgNotePasswordEncryption)
        .password;
    }
  }
);
</script>
