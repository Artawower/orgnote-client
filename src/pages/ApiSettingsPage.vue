<template>
  <div class="full-width">
    <h5 class="text-h5 q-pb-lg">API {{ $t('keys') }}</h5>
    <q-field
      v-for="token in tokens"
      :key="token?.id"
      color="teal"
      outlined
      :label="$t('key')"
      stack-label
      class="token-field"
    >
      <template v-slot:append>
        <div class="token-actions row">
          <q-btn
            @click="settingsStore.removeToken(token)"
            icon="delete"
            class="btn-flat delete-btn q-mr-xs"
          >
          </q-btn>
          <action-btn
            icon="content_copy"
            active-icon="done"
            @click="copyToken(token)"
          ></action-btn>
        </div>
      </template>
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">
          {{ token.token }}
        </div>
      </template>
    </q-field>
    <q-btn
      @click="settingsStore.createNewToken"
      :disable="!authStore.user.active"
      flat
      color="black"
      class="full-width"
      :label="$t('Create new token')"
    />
  </div>
</template>

<script lang="ts" setup>
import { copyToClipboard } from 'quasar';
import { ModelsAPIToken } from 'src/generated/api';
import { useSettingsStore } from 'src/stores/settings';

import { toRefs } from 'vue';

import ActionBtn from 'src/components/ui/ActionBtn.vue';
import { useAuthStore } from 'src/stores/auth';

const settingsStore = useSettingsStore();
const { tokens } = toRefs(settingsStore);
settingsStore.getApiTokens();

const authStore = useAuthStore();

const copyToken = (token: ModelsAPIToken) => {
  copyToClipboard(token.token);
};
</script>

<style lang="scss">
.token-field {
  .action-btn,
  .delete-btn {
    position: relative;
    display: none;
  }
  &:hover {
    .action-btn,
    .delete-btn {
      display: flex;
    }
  }
}
</style>
