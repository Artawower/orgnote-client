<template>
  <div class="full-width">
    <template v-if="authStore.user.active">
      <everything-fine :text="$t('you are successfully subscribed!')" />
      <used-space />
    </template>
    <template v-else>
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
import EverythingFine from 'src/components/ui/EverythingFine.vue';

const subscriptionKey = ref('');

const authStore = useAuthStore();
</script>
