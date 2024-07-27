<template>
  <navigation-header />

  <div class="full-width content">
    <menu-group title="encryption type" :items="encryptionMenuItems" />
    <menu-group
      v-if="config.encryption.type === 'gpgPassword'"
      title="credentials"
      :items="passwordEncryptionMenuItems"
    />

    <template v-if="config.encryption.type === 'gpgKeys'">
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
      <settings-description
        text="be careful, the old encryption keys will be lost. Third-party clients will need to update encryption keys."
      />
    </template>

    <template v-if="config.encryption.type !== 'disabled'">
      <menu-group :items="encryptionActionsMenuitems" />
    </template>
  </div>
</template>

<script lang="ts" setup>
import { OrgNoteGpgEncryption } from 'orgnote-api';
import EncryptionKeysForm from 'src/components/containers/EncryptionKeysForm.vue';
import { useEncryptionStore } from 'src/stores/encryption.store';
import { useSettingsStore } from 'src/stores/settings';
import { onBeforeUnmount } from 'vue';
import { getCssVar, uploadFile } from 'src/tools';
import { useModalStore } from 'src/stores/modal';
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import SettingsDescription from 'src/components/ui/SettingsDescription.vue';
import { buildMenuItems } from 'src/tools/config-menu-builder';
import { AVAILABLE_CONFIG_SCHEME } from 'src/constants/default-config.constant';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';

const { config } = useSettingsStore();

const encryptionStore = useEncryptionStore();
const encryptExistingNotes = async () => {
  encryptionStore.changeEncryptionType();
};

const modalStore = useModalStore();
const generateNewGpgKeys = async () => {
  modalStore.open(EncryptionKeysForm, {
    title: 'generate new GPG keys',
  });
};

const initialType = config.encryption.type;

const uploadPrivateKey = async () => {
  const uploadedPrivateKey = await uploadFile();
  (config.encryption as OrgNoteGpgEncryption).privateKey =
    await uploadedPrivateKey.text();
};

const uploadPublicKey = async () => {
  const uploadedPublicKey = await uploadFile();
  (config.encryption as OrgNoteGpgEncryption).publicKey =
    await uploadedPublicKey.text();
};

onBeforeUnmount(async () => {
  const encryptionTypeChanged = config.encryption?.type !== initialType;
  if (encryptionTypeChanged) {
    await encryptExistingNotes();
  }
});

const encryptionMenuItems: MenuItemProps[] = buildMenuItems(config.encryption, {
  configScheme: AVAILABLE_CONFIG_SCHEME,
  includeKeys: ['type'],
});

const passwordEncryptionMenuItems: MenuItemProps[] = [
  {
    reactivePath: config.encryption,
    reactiveKey: 'password',
    label: 'encryption password',
    type: 'text',
  },
];

const gpgEncryptionPublicKeyMenuItems: MenuItemProps[] = [
  {
    type: 'textarea',
    reactivePath: config.encryption,
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
    reactivePath: config.encryption,
    reactiveKey: 'privateKey',
  },
  {
    label: 'upload private key',
    type: 'action',
    handler: uploadPrivateKey,
    color: getCssVar('blue'),
  },
];

const encryptionActionsMenuitems: MenuItemProps[] = [
  {
    label: 'encrypt and sync existing notes',
    color: getCssVar('red'),
    handler: encryptExistingNotes,
  },
];

const gpgEncryptionPrivateKeyPassphraseMenuItems: MenuItemProps[] = [
  {
    label: 'private key passphrase (optional)',
    type: 'text',
    reactivePath: config.encryption,
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
