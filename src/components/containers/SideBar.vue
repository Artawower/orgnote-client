<template>
  <q-list>
    <template v-if="user">
      <q-item
        clickable
        v-if="user"
        class="column justify-center"
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

      <q-item v-if="isMyNotePage" @click="goToMainPage" clickable>
        <q-item-section avatar>
          <q-icon name="feed" />
        </q-item-section>

        <q-item-section>{{ $t('All articles') }}</q-item-section>
      </q-item>

      <q-item v-else clickable @click="goToMyNotes">
        <q-item-section avatar>
          <q-icon name="account_box" />
        </q-item-section>

        <q-item-section>{{ $t('My notes') }}</q-item-section>
      </q-item>

      <q-item
        v-if="authStore.user"
        clickable
        :to="{
          name: RouteNames.UserGraph,
          params: { userId: authStore.user.id },
        }"
      >
        <q-item-section avatar>
          <q-icon name="hub" />
        </q-item-section>

        <q-item-section>{{ $t('Graph') }}</q-item-section>
      </q-item>

      <q-item v-if="user" :to="{ name: RouteNames.CreateNote }" clickable>
        <q-item-section avatar>
          <q-icon name="add" />
        </q-item-section>
        <q-item-section>{{ $t('Create note') }}</q-item-section>
      </q-item>

      <q-item v-if="user" @click="logout" clickable>
        <q-item-section avatar>
          <q-icon name="logout" />
        </q-item-section>

        <q-item-section class="text-capitalize">
          {{ $t('logout') }}
        </q-item-section>
      </q-item>

      <q-item @click="goToSettings" clickable>
        <q-item-section avatar>
          <q-icon name="settings" />
        </q-item-section>

        <q-item-section class="text-capitalize">
          {{ $t('settings') }}
        </q-item-section>
      </q-item>
    </template>

    <template v-else>
      <q-item clickable class="column justify-center">
        <q-avatar size="160px" class="q-mx-auto">
          <img src="/icons/brain.png" />
        </q-avatar>
        <br />
        <div class="text-center subtitle text-weight-light text-italic">
          <random-quote />
        </div>
      </q-item>
      <q-item>
        <div class="text-center q-mt-lg full-width">
          {{ $t('login to create your first note') }}
        </div>
      </q-item>
      <login-buttons />
    </template>

    <q-separator />

    <q-item>
      <language-switcher></language-switcher>
    </q-item>
  </q-list>
</template>

<script lang="ts" setup>
import LanguageSwitcher from 'components/LanguageSwitcher.vue';
import LoginButtons from 'components/LoginButtons.vue';
import RandomQuote from 'components/containers/RandomQuote.vue';
import { MAIN_PAGE_ROUTE, RouteNames } from 'src/router/routes';
import { ModelsPublicUser } from 'src/generated/api';
import { useRouter } from 'vue-router';
import { computed, toRef } from 'vue';
import { useAuthStore } from 'src/stores/auth';

const props = defineProps<{
  user: ModelsPublicUser;
}>();

const router = useRouter();
const goToMainPage = () => router.push({ path: MAIN_PAGE_ROUTE.path });

const isMyNotePage = computed(
  () => router.currentRoute.value.name === RouteNames.UserNotes
);

const openProfile = () => {
  window.open(user.value.profileUrl, '_blank');
};

const authStore = useAuthStore();
const user = toRef(props, 'user');

const logout = () => authStore.logout();
const goToSettings = () => router.push({ name: RouteNames.Settings });
const goToMyNotes = () => {
  router.push({
    name: RouteNames.UserNotes,
    params: { userId: user.value.id },
  });
};
</script>
