<template>
  <page-wrapper
    v-touch-swipe.mouse.left="mobileOnly(sidebar.close)"
    v-touch-swipe.mouse.right="mobileOnly(sidebar.open)"
  >
    <main-sidebar ref="sidebarRef" />
    <div class="content">
      <visibility-wrapper tablet-below>
        <div @click="closeMainSidebar" v-if="sidebar.opened" class="backdrop"></div>
      </visibility-wrapper>
      <router-view />
      <visibility-wrapper tablet-below>
        <main-footer />
      </visibility-wrapper>
    </div>
    <modal-window />
  </page-wrapper>
</template>

<script setup lang="ts">
import MainFooter from 'src/containers/MainFooter.vue';
import PageWrapper from 'src/components/PageWrapper.vue';
import MainSidebar from 'src/containers/MainSidebar.vue';
import ModalWindow from 'src/containers/ModalWindow.vue';
import { api } from 'src/boot/api';
import { ref } from 'vue';
import { mobileOnly } from 'src/utils/platform-specific';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';

const sidebar = api.ui.useSidebar();
const sidebarRef = ref(null);

const { tabletBelow } = api.ui.useScreenDetection();

const closeMainSidebar = () => {
  if (tabletBelow.value) {
    sidebar.close();
  }
};
</script>

<style lang="scss" scoped>
.content {
  height: 100vh;
  height: 100dvh;
  flex: 1;
  overflow: hidden;
}

@include tablet-below {
  .backdrop {
    position: absolute;
    background-color: var(--backdrop-bg);
    width: 100%;
    height: 100%;
    z-index: 1;
  }
}

.page {
  flex-direction: row;
}
</style>
