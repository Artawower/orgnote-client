<template>
  <!-- TODO: master move to separated component: composite-bar  -->
  <q-drawer
    class="composite-bar top-offset"
    show-if-above
    :mini="true"
    v-model="compositeOpened"
    :breakpoint="0"
    :overlay="fullWidth"
    no-swipe-backdrop
  >
    <!-- TODO: master this menu should be built from commands -->
    <q-scroll-area class="fit q-pt-xs">
      <q-list class="side-panel-actions">
        <q-item
          @click="sidebarStore.toggleWithComponent(ProfileSideBar)"
          clickable
          class="flex items-center justify-center"
        >
          <q-avatar size="24px" class="profile-icon">
            <img v-if="user?.avatarUrl" :src="user.avatarUrl" />
            <q-icon v-else name="account_circle" size="sm"></q-icon>
          </q-avatar>
        </q-item>

        <side-panel-items
          :items="toolbarStore.toolbarActions"
          @execute-action="executeActionHandler"
        />
      </q-list>

      <q-list class="side-panel-actions">
        <q-item clickable @click="openProjectInfo">
          <q-item-section avatar>
            <q-icon name="o_info" />
          </q-item-section>

          <q-item-section class="text-capitalize">
            {{ $t('project info') }}
          </q-item-section>
        </q-item>

        <template v-if="!fullWidth">
          <side-panel-items
            :items="toolbarStore.systemActions"
            @execute-action="executeActionHandler"
          />
        </template>

        <q-item @click="openSettings" clickable>
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>

          <q-item-section class="text-capitalize">
            {{ $t('settings') }}
          </q-item-section>
        </q-item>

        <q-item v-if="fullWidth" @click="closeSideBar" clickable>
          <q-item-section avatar>
            <q-icon name="arrow_circle_left" />
          </q-item-section>

          <q-item-section class="text-capitalize">
            {{ $t('toggle sidebar') }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>
  <!-- TODO: master disable quasar animtion. It's very irritable -->
  <q-drawer
    v-show="sidebarStore.opened"
    v-touch-swipe.mouse.left="closeSideBarForMobile"
    class="main-sidebar top-offset"
    :width="drawerWidth - getNumericCssVar('sidebar-width')"
    :overlay="fullWidth"
    :breakpoint="0"
    no-swipe-backdrop
    v-model="sidebarStore.opened"
  >
    <action-pane-wrapper>
      <component :is="sidebarStore.component"></component>
    </action-pane-wrapper>
  </q-drawer>
</template>

<script lang="ts" setup>
import { useQuasar } from 'quasar';
import { User } from 'src/models';
import { useModalStore, useToolbarStore } from 'src/stores';
import { useSidebarStore } from 'src/stores/sidebar';
import { getNumericCssVar } from 'src/tools';

import {
  computed,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  toRef,
} from 'vue';

import ActionPaneWrapper from 'src/components/ActionPaneWrapper.vue';
import ProfileSideBar from 'src/components/containers/ProfileSideBar.vue';
import SidePanelItems from 'src/components/containers/SidePanelItems.vue';
import ProjectInfo from 'src/pages/ProjectInfo.vue';
import SettingsPage from 'src/pages/SettingsPage.vue';
import { useKeybindingStore } from 'src/stores/keybindings';
import { CommandPreview } from 'orgnote-api';

const props = defineProps<{
  user?: User;
  fullWidth?: boolean;
}>();

const emits = defineEmits<{
  (e: 'opened', val: boolean): void;
}>();

const user = toRef(props, 'user');
const fullWidth = toRef(props, 'fullWidth');
const compositeOpened = ref(true);

const sidebarStore = useSidebarStore();
const { executeCommand } = useKeybindingStore();

const closeSideBar = () => {
  emits('opened', false);
  sidebarStore.close();
};

const closeSideBarForMobile = () => {
  if (!fullWidth.value) {
    return;
  }
  closeSideBar();
};

const windowWidth = ref(window.innerWidth);

const setupWindowWidth = () => {
  windowWidth.value = window.innerWidth;
};

const showSidebarForSmalDevice = () => {
  if (!fullWidth.value) {
    return;
  }
  sidebarStore.open();
};

onBeforeMount(() => showSidebarForSmalDevice());
onMounted(() => window.addEventListener('resize', setupWindowWidth));
onUnmounted(() => window.removeEventListener('resize', setupWindowWidth));

const drawerWidth = computed(() => {
  if (fullWidth.value) {
    return windowWidth.value;
  }
  return 360;
});

const toolbarStore = useToolbarStore();

const executeActionHandler = (cmd: CommandPreview) => {
  closeSideBarForMobile();
  executeCommand(cmd);
};

const modalStore = useModalStore();
const openSettings = () => modalStore.open(SettingsPage, { title: 'settings' });
const openProjectInfo = () => modalStore.open(ProjectInfo);

// NOTE: master strange behaviour of caret inside editor when it has focus
const $q = useQuasar();
if ($q.platform.is.ios) {
  (document.activeElement as HTMLInputElement)?.blur();
}
</script>

<style lang="scss">
.q-scrollarea__content {
  @include flexify(column, space-between, center);
}

.q-list {
  width: 100%;
}

.q-drawer-container:nth-child(3) {
  aside {
    left: var(--sidebar-width);
  }
}

.composite-bar,
.main-sidebar {
  padding-bottom: var(--device-padding-bottom);
}

.side-panel-actions .q-item {
  .q-focus-helper {
    position: absolute;
    border-radius: var(--item-default-radius);
    transform: translate(-50%, -50%);
    top: 50%;
    width: 40px;
    height: 40px;
    left: 50%;
  }
}
</style>
