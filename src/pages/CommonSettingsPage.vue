<template>
  <div class="full-width">
    <h5 class="text-h5 q-pb-lg text-capitalize">
      {{ $t('common settings') }}
    </h5>
    <language-switcher></language-switcher>

    <div class="q-pt-md">
      <q-btn @click="clearAllData" class="full-width" flat text-color="red">{{
        $t('clear all local data')
      }}</q-btn>
    </div>
    <div class="q-pt-md">
      <q-btn
        @click="forceResync"
        class="full-width"
        flat
        text-color="red"
        :disabled="authStore.user?.isAnonymous"
        >{{ $t('force sync') }}</q-btn
      >
    </div>
    <div class="q-pt-md">
      <q-btn @click="removeAccount" class="full-width" flat text-color="red">{{
        $t('remove account')
      }}</q-btn>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { db } from 'src/boot/repositories';
import { RouteNames } from 'src/router/routes';
import { useAuthStore, useOrgNoteApiStore } from 'src/stores';
import { useRouter } from 'vue-router';

import LanguageSwitcher from 'components/LanguageSwitcher.vue';

const { orgNoteApi } = useOrgNoteApiStore();

const router = useRouter();
const clearAllData = async () => {
  const clear = await orgNoteApi.interaction.confirm(
    'clear all local data',
    'are you sure you want to delete all data?'
  );

  if (!clear) {
    return;
  }

  await router.push({ name: RouteNames.Home });
  localStorage.clear();
  await db.dropAll();
  window.location.reload();
};

const forceResync = async () => {
  localStorage.removeItem('sync');
  await db.dropAll();
  await router.push({ name: RouteNames.Home });
  window.location.reload();
};

const authStore = useAuthStore();

const removeAccount = async () => {
  const confirmed = await orgNoteApi.interaction.confirm(
    'remove account',
    'are you sure you want to remove your account?'
  );

  if (!confirmed) {
    return;
  }
  await authStore.removeUserAccount();
};
</script>

<style lang="scss"></style>
