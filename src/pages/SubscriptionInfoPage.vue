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
        <template v-slot:append>
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
    </template>
  </div>
</template>

<script lang="ts" setup>
import { useAuthStore } from 'src/stores';

import { ref } from 'vue';

import UsedSpace from 'src/components/containers/UsedSpace.vue';
import CodeBlock from 'src/components/ui/CodeBlock.vue';
import EverythingFine from 'src/components/ui/EverythingFine.vue';

const subscriptionKey = ref('');

const authStore = useAuthStore();
</script>

<style lang="scss" scoped>
.used-space {
  margin-top: var(--default-block-margin);
}
</style>
