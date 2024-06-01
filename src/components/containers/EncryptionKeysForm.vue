<template>
  <the-block>
    <form>
      <q-input
        class="fg-main q-mt-md"
        standout="bg-main"
        type="text"
        v-model="params.username"
        :label="$t('username')"
      />
      <q-input
        class="fg-main q-mt-md"
        standout="bg-main"
        type="email"
        autocomplete="off"
        v-model="params.email"
        :label="$t('email')"
      />
      <q-input
        class="fg-main q-mt-md"
        standout="bg-main"
        type="password"
        auto-complete="new-password"
        v-model="params.passphrase"
        :label="$t('passphrase')"
      />

      <q-card-actions align="right">
        <q-btn
          @click="generateNewGpgKeys"
          flat
          color="black"
          class="full-width q-mt-md"
          :label="$t('generate')"
        />
      </q-card-actions>
    </form>
  </the-block>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import TheBlock from '../ui/TheBlock.vue';
import { generateGpgKeys } from 'src/tools';
import { useSettingsStore } from 'src/stores/settings';
import { useConfirmationModalStore } from 'src/stores/confirmation-modal';
import { useAuthStore } from 'src/stores/auth';
import { useModalStore } from 'src/stores/modal';

const authStore = useAuthStore();

const params = ref<{
  username: string;
  passphrase?: string;
  email: string;
}>({
  username: authStore.user.nickName,
  email: authStore.user.email,
});

const settingsStore = useSettingsStore();
const confirmationModalStore = useConfirmationModalStore();
const modalStore = useModalStore();

const generateNewGpgKeys = async () => {
  const regenerate = await confirmationModalStore.confirm(
    'generate new GPG keys',
    'are you sure you want to generate new GPG keys? Your old keys will be lost.'
  );
  if (regenerate) {
    await createNewGpgKeys();
  }
  modalStore.close();
};

const createNewGpgKeys = async () => {
  const { privateKey, publicKey } = await generateGpgKeys({
    username: params.value.username,
    email: params.value.email,
    passphrase: params.value.passphrase,
  });

  settingsStore.config.encryption = {
    publicKey,
    privateKey,
    type: 'gpgKeys',
  };
};
</script>
