<template>
  <q-scroll-area class="fit">
    <q-list>
      <q-item
        v-if="user"
        clickable
        class="column justify-center avatar-item"
        @click="openProfile"
      >
        <q-avatar size="160px" class="q-mx-auto">
          <img :src="user.avatarUrl" />
        </q-avatar>
        <div class="text-center q-mt-lg">
          {{ user.nickName }}
        </div>
        <div class="text-center subtitle text-weight-light text-italic">
          {{ user.email }}
        </div>
        <br />
        <div class="text-center subtitle text-weight-light text-italic">
          <random-quote />
        </div>
      </q-item>

      <q-item v-else clickable class="column justify-center">
        <q-avatar size="160px" class="q-mx-auto">
          <img src="/icons/brain.png" />
        </q-avatar>
        <br />
        <div class="text-center subtitle text-weight-light text-italic">
          <random-quote />
        </div>
      </q-item>
      <template v-if="!user">
        <q-item>
          <div class="text-center q-mt-lg full-width">
            {{ $t('login to create your first note') }}
          </div>
        </q-item>
        <login-buttons />
      </template>

      <q-item v-else @click="logout" clickable>
        <q-item-section avatar>
          <q-icon name="logout" />
        </q-item-section>

        <q-item-section class="text-capitalize">
          {{ $t('logout') }}
        </q-item-section>
      </q-item>
    </q-list>

    <q-list>
      <q-item class="text-italic flex-center">{{ version }}</q-item>
      <q-item>
        <download-links></download-links>
      </q-item>
    </q-list>
  </q-scroll-area>
</template>

<script lang="ts" setup>
import LoginButtons from 'components/LoginButtons.vue';
import RandomQuote from 'components/containers/RandomQuote.vue';
import DownloadLinks from 'components/DownloadLinks.vue';
import { version } from '../../../package.json';
import { useAuthStore } from 'src/stores';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();

const { user } = storeToRefs(authStore);

const openProfile = () => {
  window.open(user.value.profileUrl, '_blank');
};

const logout = () => authStore.logout();
</script>
