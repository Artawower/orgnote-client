<template>
  <q-drawer
    show-if-above
    :mini="miniState"
    v-model="drawer"
    :width="320"
    :breakpoint="0"
    bordered
  >
    <q-scroll-area class="fit">
      <q-list>
        <template v-if="user">
          <q-item
            v-if="!miniState"
            clickable
            class="column justify-center avatar-item"
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
            <br />
            <div class="text-center subtitle text-weight-light text-italic">
              <random-quote />
            </div>
          </q-item>

          <q-item
            clickable
            :to="{
              name: RouteNames.UserNotes,
              params: { userId: user.id },
            }"
          >
            <q-item-section avatar>
              <q-icon name="account_box" />
            </q-item-section>

            <q-item-section>{{ $t('My notes') }}</q-item-section>
          </q-item>

          <q-item :to="{ name: RouteNames.NoteList }" clickable exact>
            <q-item-section avatar>
              <q-icon name="feed" />
            </q-item-section>

            <q-item-section>{{ $t('All articles') }}</q-item-section>
          </q-item>

          <q-item clickable @click="search">
            <q-item-section avatar>
              <q-icon name="search"></q-icon>
            </q-item-section>

            <q-item-section>
              {{ $t('search') }}
            </q-item-section>
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

          <q-item v-if="user" :to="{ name: RouteNames.EditNote }" clickable>
            <q-item-section avatar>
              <q-icon name="add" />
            </q-item-section>
            <q-item-section>{{ $t('Create note') }}</q-item-section>
          </q-item>

          <q-item
            class="hidden"
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

          <q-item v-if="user" @click="logout" clickable>
            <q-item-section avatar>
              <q-icon name="logout" />
            </q-item-section>

            <q-item-section class="text-capitalize">
              {{ $t('logout') }}
            </q-item-section>
          </q-item>
        </template>

        <template v-else>
          <q-item v-if="!miniState" clickable class="column justify-center">
            <q-avatar size="160px" class="q-mx-auto">
              <img src="/icons/brain.png" />
            </q-avatar>
            <br />
            <div class="text-center subtitle text-weight-light text-italic">
              <random-quote />
            </div>
          </q-item>
          <q-item v-if="!miniState">
            <div class="text-center q-mt-lg full-width">
              {{ $t('login to create your first note') }}
            </div>
          </q-item>
          <login-buttons :vertical="miniState" />
        </template>

        <template v-if="!miniState">
          <q-item class="text-italic flex-center">{{ version }}</q-item>
          <q-item>
            <download-links></download-links>
          </q-item>
        </template>
      </q-list>

      <q-list>
        <q-separator />

        <q-item
          v-if="user"
          clickable
          @click="executeCommand({ command: COMMAND.toggleExecuteCommand })"
        >
          <q-item-section avatar>
            <q-icon name="terminal" />
          </q-item-section>

          <q-item-section class="text-capitalize">
            {{ $t('execute command') }}
          </q-item-section>
        </q-item>

        <q-item v-if="user" :to="{ name: RouteNames.Settings }" clickable>
          <q-item-section avatar>
            <q-icon name="settings" />
          </q-item-section>

          <q-item-section class="text-capitalize">
            {{ $t('settings') }}
          </q-item-section>
        </q-item>

        <q-item @click="toggleMiniState" clickable>
          <q-item-section avatar>
            <q-icon
              :name="miniState ? 'arrow_circle_right' : 'arrow_circle_left'"
            />
          </q-item-section>

          <q-item-section class="text-capitalize">
            {{ $t('toggle sidebar') }}
          </q-item-section>
        </q-item>
      </q-list>
    </q-scroll-area>
  </q-drawer>
</template>

<script lang="ts" setup>
import LoginButtons from 'components/LoginButtons.vue';
import RandomQuote from 'components/containers/RandomQuote.vue';
import DownloadLinks from 'components/DownloadLinks.vue';
import { MAIN_PAGE_ROUTE, RouteNames } from 'src/router/routes';
import { ModelsPublicUser } from 'src/generated/api';
import { ref, toRef, watch } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useKeybindingStore } from 'src/stores/keybindings';
import { COMMAND } from 'src/hooks';
import { version } from '../../../package.json';

const props = defineProps<{
  user: ModelsPublicUser;
  opened: boolean;
}>();

const openProfile = () => {
  window.open(user.value.profileUrl, '_blank');
};

const authStore = useAuthStore();
const user = toRef(props, 'user');
const drawer = ref(true);

const logout = () => authStore.logout();

const { executeCommand } = useKeybindingStore();

const search = () => {
  executeCommand({ command: COMMAND.openSearch });
};

const miniState = ref(props.opened);
const toggleMiniState = () => {
  miniState.value = !miniState.value;
};

watch(
  () => props.opened,
  (opened) => {
    miniState.value = opened;
  }
);
</script>

<style lang="scss">
.q-scrollarea__content {
  @include flexify(column, space-between, center);
}

.q-list {
  width: 100%;
}
</style>
