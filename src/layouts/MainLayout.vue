<template>
  <q-layout view="lHh Lpr lFf">
    <layout-header @left-panel-toggled="toggleLeftDrawer" />

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-scroll-area class="fit">
        <!-- TODO: master  separated sidebar component-->
        <q-list>
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

            <q-item-section> {{ $t('logout') }} </q-item-section>
          </q-item>

          <q-item>
            <language-switcher></language-switcher>
          </q-item>

          <login-buttons v-if="!user" />

          <q-separator />

          <q-item v-if="user" @click="goToSettings" clickable>
            <q-item-section avatar>
              <q-icon name="settings" />
            </q-item-section>

            <q-item-section> Settings </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="content">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import LanguageSwitcher from 'components/LanguageSwitcher.vue';
import { useRouter } from 'vue-router';
import { MAIN_PAGE_ROUTE } from 'src/router/routes';
import LoginButtons from 'components/LoginButtons.vue';
import { RouteNames } from 'src/router/routes';
import { useAuthStore } from 'src/stores/auth';
import LayoutHeader from 'src/components/LayoutHeader.vue';

const router = useRouter();
const goToMainPage = () => router.push({ path: MAIN_PAGE_ROUTE.path });

const isMyNotePage = computed(
  () => router.currentRoute.value.name === RouteNames.UserNotes
);

const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => (leftDrawerOpen.value = !leftDrawerOpen.value);

const authStore = useAuthStore();
const user = computed(() => authStore.user);
authStore.verifyUser();

const openProfile = () => {
  window.open(user.value.profileUrl, '_blank');
};

const logout = () => authStore.logout();
const goToSettings = () => router.push({ name: RouteNames.Settings });
const goToMyNotes = () => {
  router.push({
    name: RouteNames.UserNotes,
    params: { userId: user.value.id },
  });
};
</script>

<style lang="scss">
.content {
  max-width: 1080px;
  margin: auto;
}
</style>
