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

          <q-item v-if="isMyNotePage" @click="goToMainPage" clickable>
            <q-item-section avatar>
              <q-icon name="feed" />
            </q-item-section>

            <q-item-section>{{ $t('All articles') }}</q-item-section>
          </q-item>

          <q-item v-else clickable @click="goToMyNotes">
            <q-item-section avatar>
              <q-icon name="account_box" />
            </q-item-section>

            <q-item-section>{{ $t('My notes') }}</q-item-section>
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

          <q-item v-if="user" :to="{ name: RouteNames.CreateNote }" clickable>
            <q-item-section avatar>
              <q-icon name="add" />
            </q-item-section>
            <q-item-section>{{ $t('Create note') }}</q-item-section>
          </q-item>

          <q-item :to="{ name: RouteNames.Extensions }" clickable>
            <q-item-section avatar>
              <q-icon name="extension" />
            </q-item-section>

            <q-item-section class="text-capitalize">
              {{ $t('extensions') }}
            </q-item-section>
          </q-item>

          <q-item
            v-if="isListPage || isMyNotePage"
            @click="toggleTile"
            clickable
          >
            <q-item-section avatar>
              <q-icon :name="isTile ? 'format_list_bulleted' : 'grid_view'" />
            </q-item-section>

            <q-item-section class="text-capitalize">
              {{ $t('note view') }}
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
          <q-item>
            <div class="text-center q-mt-lg full-width">
              {{ $t('login to create your first note') }}
            </div>
          </q-item>
          <login-buttons />
        </template>

        <q-item v-if="!miniState">
          <language-switcher></language-switcher>
        </q-item>
      </q-list>

      <q-list v-if="user">
        <q-separator />
        <q-item :to="{ name: RouteNames.Settings }" clickable>
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
import LanguageSwitcher from 'components/LanguageSwitcher.vue';
import LoginButtons from 'components/LoginButtons.vue';
import RandomQuote from 'components/containers/RandomQuote.vue';
import { MAIN_PAGE_ROUTE, RouteNames } from 'src/router/routes';
import { ModelsPublicUser } from 'src/generated/api';
import { useRouter } from 'vue-router';
import { computed, ref, toRef } from 'vue';
import { useAuthStore } from 'src/stores/auth';
import { useViewStore } from 'src/stores/view';

const props = defineProps<{
  user: ModelsPublicUser;
  opened: boolean;
}>();

const router = useRouter();
const goToMainPage = () => router.push({ path: MAIN_PAGE_ROUTE.path });

const isMyNotePage = computed(
  () => router.currentRoute.value.name === RouteNames.UserNotes
);

const openProfile = () => {
  window.open(user.value.profileUrl, '_blank');
};

const authStore = useAuthStore();
const user = toRef(props, 'user');
const drawer = ref(true);

const logout = () => authStore.logout();

const goToMyNotes = () => {
  router.push({
    name: RouteNames.UserNotes,
    params: { userId: user.value.id },
  });
};

const search = () => {
  console.log('Search will be here');
};

const miniState = ref(true);
const toggleMiniState = () => {
  miniState.value = !miniState.value;
};

const isListPage = computed(
  () => router.currentRoute.value.name === RouteNames.NoteList
);

const viewStore = useViewStore();
const isTile = computed(() => viewStore.tile);

const toggleTile = () => {
  viewStore.toggleTile();
};
</script>

<style lang="scss">
.q-scrollarea__content {
  @include flexify(column, space-between, center);
}

.q-list {
  width: 100%;
}
</style>
