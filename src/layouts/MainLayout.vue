<template>
  <q-layout view="lHh Lpr lFf">
    <!-- TODO: master  header as high level different component -->
    <q-header
      :class="[
        $q.dark.isActive ? 'dark-header text-grey-12' : 'bg-white text-grey-10',
      ]"
    >
      <q-toolbar class="header-content">
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title @click="goToMainPage" class="cursor-pointer"
          >Second brain</q-toolbar-title
        >

        <q-icon
          v-if="isListPage || isMyNotePage"
          @click="toggleTile"
          :name="isTile ? 'format_list_bulleted' : 'grid_view'"
          size="2rem"
          class="tile-mode-btn cursor-pointer"
        />
        <q-icon
          @click="toggleDarkMode"
          name="brightness_4"
          size="2rem"
          class="dark-mode-btn cursor-pointer"
        />
        <q-icon
          v-if="isViewDetailPage"
          @click="toggleCollapse"
          size="2rem"
          :name="isExpanded ? 'unfold_less' : 'unfold_more'"
          class="cursor-pointer fold-btn"
        ></q-icon>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-scroll-area class="fit">
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

            <q-item-section> All articles </q-item-section>
          </q-item>
          <q-item v-else clickable @click="goToMyNotes">
            <q-item-section avatar>
              <q-icon name="account_box" />
            </q-item-section>

            <q-item-section> My notes </q-item-section>
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
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { MAIN_PAGE_ROUTE } from 'src/router/routes';
import { useViewStore } from 'src/stores/view';
import LoginButtons from 'components/LoginButtons.vue';
import { RouteNames } from 'src/router/routes';
import { useAuthStore } from 'src/stores/auth';

const $q = useQuasar();

const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => (leftDrawerOpen.value = !leftDrawerOpen.value);

const toggleDarkMode = () => {
  $q.dark.set(!$q.dark.isActive);
};

const router = useRouter();
const goToMainPage = () => router.push({ path: MAIN_PAGE_ROUTE.path });
const isViewDetailPage = computed(
  () => router.currentRoute.value.name === RouteNames.NoteView
);

const viewStore = useViewStore();
const isExpanded = computed(() => viewStore.someNodeVisible);

const toggleCollapse = () => {
  viewStore.setCollapseStatusForAllNodes(!isExpanded.value);
};

const isTile = computed(() => viewStore.tile);
const toggleTile = () => {
  viewStore.toggleTile();
};

const isListPage = computed(
  () => router.currentRoute.value.name === RouteNames.NoteList
);
const isMyNotePage = computed(
  () => router.currentRoute.value.name === RouteNames.UserNotes
);

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
.dark-header {
  background: $dark-smog !important;
}

.tile-mode-btn {
  margin-right: 1rem;
}

.content {
  max-width: 1080px;
  margin: auto;
}

.fold-btn {
  margin-left: 10px;
}

.header-content {
  max-width: 1066px;
  margin: auto;
}
</style>
