<template>
  <q-layout view="lHh Lpr lFf">
    <layout-header @left-panel-toggled="toggleLeftDrawer" />

    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-scroll-area class="fit">
        <side-bar :user="user" />
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="content">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import LayoutHeader from 'src/components/LayoutHeader.vue';
import SideBar from 'src/components/containers/SideBar.vue';


const leftDrawerOpen = ref(false);
const toggleLeftDrawer = () => (leftDrawerOpen.value = !leftDrawerOpen.value);

const authStore = useAuthStore();
const user = computed(() => authStore.user);
authStore.verifyUser();

</script>

<style lang="scss">
.content {
  max-width: 1080px;
  margin: auto;
}
</style>
