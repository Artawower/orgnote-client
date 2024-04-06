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
    <q-btn
      @click="generateNewGpgKeys"
      flat
      color="black"
      class="full-width q-mt-md"
      :label="$t('generate new GPG keys')"
    />
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
import { OrgNoteEncryption } from 'orgnote-api';
import EncryptionKeysForm from 'src/components/containers/EncryptionKeysForm.vue';
import { useModalStore } from 'src/stores';
import { useEncryptionStore } from 'src/stores/encryption.store';
import { useSettingsStore } from 'src/stores/settings';

const { config } = useSettingsStore();

const encryptionOptions: { label: string; value: OrgNoteEncryption['type'] }[] =
  [
    { label: 'Disabled', value: 'disabled' },
    { label: 'GPG', value: 'gpg' },
    { label: 'Password', value: 'password' },
  ];

const encryptionStore = useEncryptionStore();
const encryptExistingNotes = async () => {
  encryptionStore.decryptExistingNotes();
};

const modalStore = useModalStore();
const generateNewGpgKeys = async () => {
  modalStore.open(EncryptionKeysForm, {
    title: 'generate new GPG keys',
  });
};
</script>
