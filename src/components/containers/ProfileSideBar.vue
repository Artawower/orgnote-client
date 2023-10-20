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
          <img v-if="user.isAnonymous" src="/icons/unicorn.png" />
          <img v-else :src="user.avatarUrl" />
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

      <template v-if="user.isAnonymous">
        <q-item>
          <div class="text-center q-mt-lg full-width">
            {{ $t('login to create your first note') }}
          </div>
        </q-item>
        <login-buttons />
      </template>

      <template v-else>
        <q-item @click="logout" clickable>
          <q-item-section avatar>
            <q-icon name="logout" />
          </q-item-section>
          <q-item-section class="text-capitalize">
            {{ $t('logout') }}
          </q-item-section>
        </q-item>
      </template>
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
import { version } from '../../../package.json';
import { storeToRefs } from 'pinia';
import { useAuthStore } from 'src/stores';

import DownloadLinks from 'components/DownloadLinks.vue';
import LoginButtons from 'components/LoginButtons.vue';
import RandomQuote from 'components/containers/RandomQuote.vue';
import UsedSpace from 'components/containers/UsedSpace.vue';

const authStore = useAuthStore();

const { user } = storeToRefs(authStore);

const openProfile = () => {
  window.open(user.value.profileUrl, '_blank');
};

const logout = () => authStore.logout();
</script>
