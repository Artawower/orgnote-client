<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
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
          @click="toggleDarkMode"
          name="brightness_4"
          size="2rem"
          class="dark-mode-btn"
        />
      </q-toolbar>
    </q-header>

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-scroll-area class="fit">
        <q-list>
          <q-item-label header> Essential Links </q-item-label>

          <q-item clickable>
            <q-item-section avatar>
              <q-icon name="inbox" />
            </q-item-section>

            <q-item-section> Inbox </q-item-section>
          </q-item>

          <q-item>
            <language-switcher></language-switcher>
          </q-item>

          <q-separator />

          <q-item clickable>
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
import { ref } from 'vue';
import LanguageSwitcher from 'components/LanguageSwitcher.vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { MAIN_PAGE_ROUTE } from 'src/router/routes';

const $q = useQuasar();

const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => (leftDrawerOpen.value = !leftDrawerOpen.value);

const toggleDarkMode = () => {
  $q.dark.set(!$q.dark.isActive);
};

const router = useRouter();

const goToMainPage = () => router.push({ path: MAIN_PAGE_ROUTE.path });
</script>

<style scss>
.dark-mode-btn {
  cursor: pointer;
}

.content {
  max-width: 1080px;
  margin: auto;
}
</style>
