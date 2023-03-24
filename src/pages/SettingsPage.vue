<template>
  <div class="col-12">
    <h4 class="text-h4">API {{ $t('keys') }}</h4>
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
            class="flat-btn delete-btn q-mr-xs"
          >
          </q-btn>
          <copy-btn @copied="copyToken(token)"></copy-btn>
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
      flat
      color="black"
      class="full-width"
      :label="$t('Create new token')"
    />
  </div>

  <div class="col-12">
    <h4 class="text-h4">{{ $t('View settings') }}</h4>
    <q-toggle
      v-model="settingsStore.showUserProfiles"
      :label="$t('Show author profile info')"
    ></q-toggle>
  </div>
</template>

<script lang="ts" setup>
import { toRefs } from 'vue';
import { useSettingsStore } from 'src/stores/settings';
import CopyBtn from 'src/components/CopyBtn.vue';
import { copyToClipboard } from 'quasar';
import { ModelsAPIToken } from 'src/generated/api';
const settingsStore = useSettingsStore();

settingsStore.getApiTokens();

const { tokens } = toRefs(settingsStore);

const copyToken = (token: ModelsAPIToken) => {
  copyToClipboard(token.token);
};
</script>

<style lang="scss">
.token-field {
  .copy-btn,
  .delete-btn {
    position: relative;
    display: none;
  }
  &:hover {
    .copy-btn,
    .delete-btn {
      display: flex;
    }
  }
}
</style>
