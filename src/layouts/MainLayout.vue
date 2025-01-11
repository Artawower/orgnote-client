<template>
  <page-wrapper v-touch-swipe.mouse.left="sidebar.close" v-touch-swipe.mouse.right="sidebar.open">
    <main-sidebar ref="sidebarRef" />
    <div class="content">
      <router-view />
      <platform-specific mobile ios android>
        <main-footer />
      </platform-specific>
    </div>
  </page-wrapper>
</template>

<script setup lang="ts">
import MainFooter from 'src/containers/MainFooter.vue';
import PageWrapper from 'src/components/PageWrapper.vue';
import MainSidebar from 'src/containers/MainSidebar.vue';
import PlatformSpecific from 'src/components/PlatformSpecific.vue';
import { onClickOutside } from '@vueuse/core';
import { api } from 'src/boot/api';
import { ref } from 'vue';

const sidebar = api.ui.useSidebar();
const sidebarRef = ref(null);

onClickOutside(sidebarRef, () => {
  sidebar.close();
});
</script>

<style lang="scss" scoped>
.content {
  height: 100vh;
  height: 100dvh;
  flex: 1;
}
</style>
