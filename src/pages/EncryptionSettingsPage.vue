<template>
  <navigation-page>
    <menu-group title="encryption type" :items="encryptionMenuItems" />
    <menu-group
      v-if="newEncryption.data.type === 'gpgPassword'"
      title="credentials"
      :items="passwordEncryptionMenuItems"
    />

    <template v-if="newEncryption.data.type === 'gpgKeys'">
      <menu-group
        title="GPG public key"
        :items="gpgEncryptionPublicKeyMenuItems"
      />
      <menu-group
        title="GPG private key"
        :items="gpgEncryptionPrivateKeyMenuItems"
      />

      <menu-group
        title="GPG private key"
        :items="gpgEncryptionPrivateKeyPassphraseMenuItems"
      />

      <menu-group title="Encrypt existing notes" :items="gpgNewKeysMenuItems" />
      <the-description
        text="be careful, the old encryption keys will be lost. Third-party clients will need to update encryption keys."
      />
    </template>

    <template v-if="undoneEncryptionMigration">
      <menu-group :items="encryptionActionsMenuitems" />
    </template>
  </navigation-page>
</template>

<script lang="ts" setup>
import { OrgNoteGpgEncryption } from 'orgnote-api';
import EncryptionKeysForm from 'src/components/containers/EncryptionKeysForm.vue';
import { getCssVar, uploadFile } from 'src/tools';
import { useModalStore } from 'src/stores/modal';
import NavigationPage from 'src/components/ui/NavigationPage.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import TheDescription from 'src/components/ui/TheDescription.vue';
import { buildMenuItems } from 'src/tools/config-menu-builder';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';
import { ENCRYPTION_CONFIG_SCHEME } from 'src/constants/default-config.constant';
import { useNoteEncryptionTasksStore } from 'src/stores/note-encryption-tasks.store';
import { useOrgNoteApiStore } from 'src/stores/orgnote-api.store';
import { onBeforeRouteLeave } from 'vue-router';
import { storeToRefs } from 'pinia';
import { computed } from 'vue';

const { newEncryption, undoneEncryptionMigration } = storeToRefs(
  useNoteEncryptionTasksStore()
);

const modalStore = useModalStore();
const generateNewGpgKeys = async () => {
  modalStore.open(EncryptionKeysForm, {
    title: 'generate new GPG keys',
  });
};

const { orgNoteApi } = useOrgNoteApiStore();

onBeforeRouteLeave(async () => {
  if (!undoneEncryptionMigration.value) {
    return;
  }
  const exit = await orgNoteApi.interaction.confirm(
    'unsaved changes',
    'are you sure you want to leave the page?'
  );

  return exit;
});

const encryptionMenuItems: MenuItemProps[] = buildMenuItems(
  newEncryption.value.data,
  {
    configScheme: ENCRYPTION_CONFIG_SCHEME,
    includeKeys: ['type'],
  }
);

const uploadPrivateKey = async () => {
  const uploadedPrivateKey = await uploadFile();
  (newEncryption.value.data as OrgNoteGpgEncryption).privateKey =
    await uploadedPrivateKey.text();
};

const uploadPublicKey = async () => {
  const uploadedPublicKey = await uploadFile();
  (newEncryption.value.data as OrgNoteGpgEncryption).publicKey =
    await uploadedPublicKey.text();
};

const passwordEncryptionMenuItems: MenuItemProps[] = [
  {
    reactivePath: newEncryption.value.data,
    reactiveKey: 'password',
    label: 'encryption password',
    type: 'text',
  },
];

const gpgEncryptionPublicKeyMenuItems: MenuItemProps[] = [
  {
    type: 'textarea',
    reactivePath: newEncryption.value.data,
    reactiveKey: 'publicKey',
  },
  {
    label: 'upload public key',
    type: 'action',
    handler: uploadPublicKey,
    color: getCssVar('blue'),
  },
];

const gpgEncryptionPrivateKeyMenuItems: MenuItemProps[] = [
  {
    type: 'textarea',
    reactivePath: newEncryption.value.data,
    reactiveKey: 'privateKey',
  },
  {
    label: 'upload private key',
    type: 'action',
    handler: uploadPrivateKey,
    color: getCssVar('blue'),
  },
];

const reencryptionDisabled = computed(
  () =>
    (newEncryption.value.data.type === 'gpgKeys' &&
      (!newEncryption.value.data.privateKey ||
        !newEncryption.value.data.publicKey)) ||
    (newEncryption.value.data.type === 'gpgPassword' &&
      !newEncryption.value.data.password)
);

const { encryptExistingNotes } = useNoteEncryptionTasksStore();
const encryptionActionsMenuitems: MenuItemProps[] = [
  {
    label: 'encrypt and sync existing notes',
    color: getCssVar('red'),
    disabled: reencryptionDisabled,
    handler: encryptExistingNotes,
  },
];

const gpgEncryptionPrivateKeyPassphraseMenuItems: MenuItemProps[] = [
  {
    label: 'private key passphrase (optional)',
    type: 'text',
    reactivePath: newEncryption.value.data,
    reactiveKey: 'privateKeyPassphrase',
  },
];

const gpgNewKeysMenuItems: MenuItemProps[] = [
  {
    label: 'generate new GPG keys',
    color: getCssVar('red'),
    handler: generateNewGpgKeys,
  },
];
</script>

<style lang="scss"></style>
