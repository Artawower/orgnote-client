<template>
  <div class="full-width">
    <template v-if="authStore.user.active">
      <everything-fine
        class="q-pb-md"
        :text="$t('you are successfully subscribed!')"
      />
      <p class="font-main color-secondary">{{ $t('activateion key') }}</p>
      <code-block :code="authStore.user.active" />
      <div class="used-space">
        <used-space />
      </div>
    </template>
    <template v-else>
      <!-- TODO: master add email field here -->
      <q-input
        class="color-white"
        standout="bg-black text-white"
        v-model="subscriptionKey"
        :label="$t('subscription key')"
      >
        <template #append>
          <q-btn
            @click="authStore.subscribe(subscriptionKey)"
            :disable="!subscriptionKey.length"
            flat
            round
            color="primary"
            icon="send"
          />
        </template>
      </q-input>

      <div class="reference font-main">
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
            {{ $t('active testers will receive a key in the release version') }}
          </li>
          <li class="capitalize">
            {{
              $t(
                'you are an open-source developer, write to app.orgnote@gmail.com'
              )
            }}
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
      </div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { onBeforeMount, ref } from 'vue';

import UsedSpace from 'src/components/containers/UsedSpace.vue';
import CodeBlock from 'src/components/ui/CodeBlock.vue';
import EverythingFine from 'src/components/ui/EverythingFine.vue';
import { useAuthStore } from 'src/stores/auth';
import { PATREON_LINK } from 'src/constants/external-links.contant';

const subscriptionKey = ref('');

const authStore = useAuthStore();
onBeforeMount(() => {
  authStore.verifyUser();
});
</script>

<style lang="scss" scoped>
.used-space {
  margin-top: var(--block-margin-md);
}

.reference {
  padding-top: var(--block-padding-md);
}
</style>
