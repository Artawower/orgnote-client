<template>
  <page-wrapper padding>
    <storage-settings />
    <card-wrapper v-if="isSetupReady">
      <menu-item active @click="finishSetup">{{ t(I18N.FINISH_SETUP) }}</menu-item>
    </card-wrapper>
  </page-wrapper>
  <modal-window />
</template>

<script lang="ts" setup>
import PageWrapper from 'src/components/PageWrapper.vue';
import ModalWindow from 'src/containers/ModalWindow.vue';
import StorageSettings from 'src/containers/StorageSettings.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from 'src/containers/MenuItem.vue';

import { RouteNames } from 'orgnote-api/constants';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/api';
import { computed } from 'vue';
import { I18N } from 'orgnote-api';

const fsManager = api.core.useFileSystemManager();
const { currentFsName } = storeToRefs(fsManager);
const { vault } = storeToRefs(api.core.useFileSystem());
const isSetupReady = computed(() => !!currentFsName.value && vault.value != null);

const router = useRouter();
const finishSetup = () => {
  router.push({ name: RouteNames.Home });
};

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>
