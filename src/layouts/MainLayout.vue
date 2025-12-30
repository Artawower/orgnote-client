<template>
  <app-flex
    class="main-layout"
    v-touch-swipe.mouse.left="mobileOnly(sidebar.close)"
    v-touch-swipe.mouse.right="mobileOnly(sidebar.open)"
    direction="row"
    start
    align-start
  >
    <main-sidebar ref="sidebarRef" />
    <div class="content">
      <visibility-wrapper tablet-below>
        <div @click="closeMainSidebar" v-if="sidebar.opened" class="backdrop"></div>
      </visibility-wrapper>
      <safe-area fit>
        <router-view />
      </safe-area>
      <visibility-wrapper tablet-below>
        <main-footer />
      </visibility-wrapper>
    </div>
    <right-panel />
    <modal-window />
    <app-notifications v-show="!hasOpenModals" />
  </app-flex>
</template>

<script setup lang="ts">
import MainFooter from 'src/containers/MainFooter.vue';
import MainSidebar from 'src/containers/MainSidebar.vue';
import RightPanel from 'src/containers/RightPanel.vue';
import ModalWindow from 'src/containers/ModalWindow.vue';
import AppNotifications from 'src/components/AppNotifications.vue';
import { api } from 'src/boot/api';
import { ref, computed, onMounted } from 'vue';
import { mobileOnly } from 'src/utils/platform-specific';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';
import SafeArea from 'src/components/SafeArea.vue';
import AppFlex from 'src/components/AppFlex.vue';
import { useRoute, useRouter } from 'vue-router';
import { reporter } from 'src/boot/report';
import { RouteNames } from 'orgnote-api';

const route = useRoute();
const router = useRouter();

const sidebar = api.ui.useSidebar();
const sidebarRef = ref(null);

const { tabletBelow } = api.ui.useScreenDetection();

const modal = api.ui.useModal();
const hasOpenModals = computed(() => modal.modals.length > 0);

const closeMainSidebar = () => {
  if (tabletBelow.value) {
    sidebar.close();
  }
};

const handleErrorFromQuery = (): void => {
  const errorMessage = route.query.error;
  if (!errorMessage || typeof errorMessage !== 'string') {
    return;
  }
  reporter.reportError(new Error(errorMessage));
  router.replace({ query: { ...route.query, error: undefined } });
};

const checkFileSystemAvailability = (): void => {
  const fileManager = api.core.useFileSystemManager();
  if (!fileManager.currentFsName) {
    router.replace({ name: RouteNames.Onboarding });
  }
};

onMounted(() => {
  handleErrorFromQuery();
  checkFileSystemAvailability();
});
</script>

<style lang="scss" scoped>
.main-layout {
  @include fit();
}

.content {
  height: 100%;
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
