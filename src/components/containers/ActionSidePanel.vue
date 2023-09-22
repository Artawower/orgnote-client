<template>
  <!-- TODO: master move to separated component: composite-bar  -->
  <q-drawer
    class="composite-bar"
    show-if-above
    :mini="true"
    v-model="compositeOpened"
    :breakpoint="0"
    :overlay="fullWidth"
    no-swipe-backdrop
    bordered
  >
    <q-scroll-area class="fit">
      <q-list>
        <template v-if="user">
          <q-item
            @click="sidebarStore.toggleWithComponent(ProfileSideBar)"
            clickable
            class="flex items-center justify-center"
          >
            <q-avatar size="24px" class="profile-icon">
              <img :src="user.avatarUrl" />
            </q-avatar>
          </q-item>

          <q-item
            @click="sidebarStore.toggleWithComponent(FileManagerSidebar)"
            clickable
            class="flex items-center justify-center"
          >
            <q-item-section avatar>
              <q-icon name="folder"></q-icon>
            </q-item-section>
          </q-item>

          <sidepanel-items
            v-if="fullWidth"
            :items="
              toolbarStore.hiddenActions.filter(
                (a) => a.sidebarPosition === 'top'
              )
            "
            @execute-action="executeActionHandler"
          />

          <template v-if="!fullWidth">
            <sidepanel-items
              :items="
                toolbarStore.allActions.filter(
                  (a) => a.sidebarPosition === 'top'
                )
              "
              @execute-action="executeActionHandler"
            />
          </template>

          <q-item
            @click="closeSideBarForMobile"
            :to="{ name: RouteNames.NoteList }"
            clickable
            exact
          >
            <q-item-section avatar>
              <q-icon name="feed" />
            </q-item-section>

            <q-item-section>{{ $t('All articles') }}</q-item-section>
          </q-item>

          <q-item
            v-if="authStore.user"
            @click="closeSideBarForMobile"
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

          <q-item
            class="hidden"
            @click="closeSideBarForMobile"
            :to="{ name: RouteNames.Extensions }"
            clickable
          >
            <q-item-section avatar>
              <q-icon name="extension" />
            </q-item-section>

            <q-item-section class="text-capitalize">
              {{ $t('extensions') }}
            </q-item-section>
          </q-item>
        </template>
        <login-buttons v-if="!user" :vertical="true"></login-buttons>
      </q-list>

      <q-list>
        <q-separator />

        <template v-if="!fullWidth">
          <sidepanel-items
            :items="
              toolbarStore.allActions.filter(
                (a) => a.sidebarPosition === 'bottom'
              )
            "
            @execute-action="executeActionHandler"
          />
        </template>

        <q-item v-if="user" :to="{ name: RouteNames.Settings }" clickable>
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
  <q-drawer
    :width="drawerWidth - getNumericCssVar('sidebar-width')"
    bordered
    :overlay="fullWidth"
    :breakpoint="0"
    no-swipe-backdrop
    v-model="sidebarStore.opened"
  >
    <component :is="sidebarStore.component"></component>
  </q-drawer>
</template>

<script lang="ts" setup>
import { RouteNames } from 'src/router/routes';
import { ModelsPublicUser } from 'src/generated/api';
import {
  computed,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  toRef,
} from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useKeybindingStore } from 'src/stores/keybindings';
import { useSidebarStore } from 'src/stores/sidebar';
import { useToolbarStore } from 'src/stores';
import { getNumericCssVar } from 'src/tools';

import ProfileSideBar from './ProfileSideBar.vue';
import LoginButtons from 'src/components/LoginButtons.vue';
import FileManagerSidebar from 'src/components/containers/FileManagerSideBar.vue';
import SidepanelItems from 'src/components/containers/SidepanelItems.vue';

const props = defineProps<{
  user?: ModelsPublicUser;
  fullWidth?: boolean;
}>();

const emits = defineEmits<{
  (e: 'opened', val: boolean): void;
}>();

const authStore = useAuthStore();
const user = toRef(props, 'user');
const fullWidth = toRef(props, 'fullWidth');
const compositeOpened = ref(true);

const keybindingStore = useKeybindingStore();

const sidebarStore = useSidebarStore();

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

const executeCommand = (cmd: {
  command: string;
  commandHandler?: (data?: unknown) => void;
}) => {
  keybindingStore.executeCommand(cmd);
  closeSideBarForMobile();
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

const executeActionHandler = (handler: () => unknown) => {
  closeSideBarForMobile();
  handler();
};
</script>

<style lang="scss">
.q-scrollarea__content {
  @include flexify(column, space-between, center);
}

.q-list {
  width: 100%;
}

.q-drawer-container:nth-child(2) {
  aside {
    left: var(--sidebar-width);
  }
}
</style>
