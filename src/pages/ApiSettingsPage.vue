<template>
  <q-page>
    <div class="col-12">
      <h4 class="text-h4 q-py-lg">API {{ $t('keys') }}</h4>
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
        flat
        color="black"
        class="full-width"
        :label="$t('Create new token')"
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import ActionBtn from 'src/components/ui/ActionBtn.vue';
import { toRefs } from 'vue';
import { copyToClipboard } from 'quasar';
import { ModelsAPIToken } from 'src/generated/api';
import { useSettingsStore } from 'src/stores/settings';

const settingsStore = useSettingsStore();
const { tokens } = toRefs(settingsStore);
settingsStore.getApiTokens();

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
