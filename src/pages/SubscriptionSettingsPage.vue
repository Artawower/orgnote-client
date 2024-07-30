<template>
  <navigation-header />
  <div class="full-width content">
    <template v-if="authStore.user.active">
      <everything-fine
        class="q-pb-md"
        :text="$t('you are successfully subscribed!')"
      />
      <menu-group
        title="activateion key"
        :items="activeSubscriptionMenuItems"
      />
      <div class="used-space">
        <used-space />
      </div>
    </template>
    <template v-else>
      <menu-group
        title="subscription key"
        :items="subscriptionInputMenuitems"
      />

      <div class="reference font-main">
        <the-description>
          <p class="capitalize">
            {{ $t('want to get a key for synchronization?') }}
          </p>

          <p class="capitalize">{{ $t('you have several options!') }}</p>
          <ul>
            <li>
              <a
                href="https://about.org-note.com"
                target="_blank"
                class="link capitalize"
                >{{ $t('sign up for beta testing') }}</a
              >
              {{
                $t('active testers will receive a key in the release version')
              }}
            </li>
            <li class="capitalize">
              {{ $t('you are an open-source developer, write to') }}
            </li>
            <li class="capitalize">
              {{
                $t(
                  'try to set up your own server for synchronization (unfortunately instructions are in progress)'
                )
              }}
            </li>
            <li class="capitalize">
              <a :href="PATREON_LINK" target="_blank" class="link">{{
                $t('subscribe to my patreon')
              }}</a>
            </li>
          </ul>
        </the-description>
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { computed, onBeforeMount, ref } from 'vue';

import UsedSpace from 'src/components/containers/UsedSpace.vue';
import EverythingFine from 'src/components/ui/EverythingFine.vue';
import NavigationHeader from 'src/components/ui/NavigationHeader.vue';
import MenuGroup from 'src/components/ui/MenuGroup.vue';
import TheDescription from 'src/components/ui/TheDescription.vue';
import { useAuthStore } from 'src/stores/auth';
import { PATREON_LINK } from 'src/constants/external-links.contant';
import { MenuItemProps } from 'src/components/ui/MenuItem.vue';
import { copyToClipboard, getCssVar } from 'src/tools';

const subscriptionKey = ref('');

const authStore = useAuthStore();
onBeforeMount(() => {
  authStore.verifyUser();
});

const activeSubscriptionMenuItems: MenuItemProps[] = [
  {
    label: authStore.user.active,
    value: authStore.user.active,
    handler: () => copyToClipboard(authStore.user.active),
    actionBtn: {
      icon: 'content_copy',
      activeIcon: 'done',
    },
  },
];

const subscriptionInputMenuitems: MenuItemProps[] = [
  {
    type: 'input',
    label: 'subscription key',
    value: subscriptionKey,
    autofocus: true,
  },
  {
    label: 'activate',
    disabled: computed(() => !subscriptionKey.value),
    handler: () => authStore.subscribe(subscriptionKey.value),
    color: getCssVar('blue'),
  },
];
</script>

<style lang="scss" scoped>
.used-space {
  margin-top: var(--block-margin-md);
}

.reference {
  padding-top: var(--block-padding-md);
}

.content {
  padding: var(--block-padding-md);
}
</style>
