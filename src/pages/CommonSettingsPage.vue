<template>
  <div class="full-width">
    <h5 class="text-h5 q-pb-lg text-capitalize">
      {{ $t('common settings') }}
    </h5>
    <language-switcher></language-switcher>

    <div class="q-pt-md">
      <q-btn @click="clearAllData" class="full-width" flat text-color="red">{{
        $t('clear all data')
      }}</q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { db } from 'src/boot/repositories';
import { RouteNames } from 'src/router/routes';
import { useConfirmationModalStore } from 'src/stores/confirmation-modal';
import { useRouter } from 'vue-router';

import LanguageSwitcher from 'components/LanguageSwitcher.vue';

const confirmationModalStore = useConfirmationModalStore();

const router = useRouter();
const clearAllData = async () => {
  const clear = await confirmationModalStore.confirm(
    'clear all data',
    'are you sure you want to delete all data?'
  );

  if (!clear) {
    return;
  }

  localStorage.clear();
  await db.dropAll();
  router.push(RouteNames.Home);
  window.location.reload();
};
</script>

<style lang="scss"></style>
