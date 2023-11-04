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
  >
    <!-- TODO: master this menu should be built from commands -->
    <q-scroll-area class="fit">
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

        <q-item
          @click="sidebarStore.toggleWithComponent(FileManagerSidebar)"
          clickable
          class="flex items-center justify-center"
        >
          <q-item-section avatar>
            <q-icon name="folder"></q-icon>
          </q-item-section>
        </q-item>

        <side-panel-items
          v-if="fullWidth"
          :items="
            toolbarStore.hiddenActions.filter(
              (a) => a.sidebarPosition === 'top'
            )
          "
          @execute-action="executeActionHandler"
        />
        <side-panel-items
          v-else
          :items="
            toolbarStore.allActions.filter((a) => a.sidebarPosition === 'top')
          "
          @execute-action="executeActionHandler"
        />

        <q-item :to="{ name: RouteNames.Dashboard }" clickable exact>
          <q-item-section avatar>
            <q-icon name="dashboard" />
          </q-item-section>

          <q-item-section>{{ $t('dashboard') }}</q-item-section>
        </q-item>

        <q-item
          @click="closeSideBarForMobile"
          :to="{ name: RouteNames.NoteList }"
          clickable
          exact
        >
          <q-item-section avatar>
            <q-icon name="feed" />
          </q-item-section>

          <q-item-section>{{ $t('all articles') }}</q-item-section>
        </q-item>

        <q-item
          v-if="isNoteDetailPage && currentNote?.isMy"
          :to="{ name: RouteNames.RawEditor, params: { id: currentNote?.id } }"
        >
          <q-item-section avatar>
            <q-icon name="edit" />
          </q-item-section>
          <q-item-section>{{ $t('edit mode') }}</q-item-section>
        </q-item>
        <q-item
          v-else-if="isNoteEditPage"
          :to="{ name: RouteNames.NoteDetail, params: { id: currentNote?.id } }"
        >
          <q-item-section avatar>
            <q-icon name="visibility" />
          </q-item-section>

          <q-item-section>{{ $t('view mode') }}</q-item-section>
        </q-item>

        <q-item
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
        <q-item
          @click="
            noteEditorStore.toggleDebug();
            closeSideBarForMobile();
          "
          v-if="isNoteEditPage && settingsStore.config.common.developerMode"
          clickable
        >
          <q-item-section avatar>
            <q-icon name="bug_report" />
          </q-item-section>

          <q-item-section class="text-capitalize">
            {{ $t('debug') }}
          </q-item-section>
        </q-item>
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
            :items="
              toolbarStore.allActions.filter(
                (a) => a.sidebarPosition === 'bottom'
              )
            "
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
    class="main-sidebar"
    :width="drawerWidth - getNumericCssVar('sidebar-width')"
    :overlay="fullWidth"
    :breakpoint="0"
    no-swipe-backdrop
    v-model="sidebarStore.opened"
  >
    <component :is="sidebarStore.component"></component>
  </q-drawer>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { User } from 'src/models';
import { RouteNames } from 'src/router/routes';
import {
  useCurrentNoteStore,
  useModalStore,
  useNoteEditorStore,
  useToolbarStore,
} from 'src/stores';
import { useAuthStore } from 'src/stores/auth';
import { useSettingsStore } from 'src/stores/settings';
import { useSidebarStore } from 'src/stores/sidebar';
import { getNumericCssVar } from 'src/tools';
import { useRoute } from 'vue-router';

import {
  computed,
  onBeforeMount,
  onMounted,
  onUnmounted,
  ref,
  toRef,
  watch,
} from 'vue';

import FileManagerSidebar from 'src/components/containers/FileManagerSideBar.vue';
import ProfileSideBar from 'src/components/containers/ProfileSideBar.vue';
import SidePanelItems from 'src/components/containers/SidePanelItems.vue';
import ProjectInfo from 'src/pages/ProjectInfo.vue';
import SettingsPage from 'src/pages/SettingsPage.vue';

const props = defineProps<{
  user?: User;
  fullWidth?: boolean;
}>();

const emits = defineEmits<{
  (e: 'opened', val: boolean): void;
}>();

const authStore = useAuthStore();
const user = toRef(props, 'user');
const fullWidth = toRef(props, 'fullWidth');
const compositeOpened = ref(true);

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

const modalStore = useModalStore();
const openSettings = () => modalStore.open(SettingsPage, { title: 'settings' });
const openProjectInfo = () => modalStore.open(ProjectInfo);

const route = useRoute();
const isNoteDetailPage = computed(() => route.name == RouteNames.NoteDetail);
const isNoteEditPage = computed(() =>
  [RouteNames.EditNote, RouteNames.RawEditor].includes(route.name as RouteNames)
);

const { currentNote } = storeToRefs(useCurrentNoteStore());

const noteEditorStore = useNoteEditorStore();
const settingsStore = useSettingsStore();
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

.composite-bar,
.main-sidebar {
  padding-bottom: var(--device-padding-bottom);
}

.side-panel-actions .q-item {
  .q-focus-helper {
    position: absolute;
    border-radius: var(--default-item-radius);
    transform: translate(-50%, -50%);
    top: 50%;
    width: 40px;
    height: 40px;
    left: 50%;
  }
}
</style>
