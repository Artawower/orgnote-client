<template>
  <template v-if="user?.active">
    <the-description>
      {{ $t('used space') }}({{ bytesToMegobytes(user.usedSpace) }} /
      {{ bytesToMegobytes(user.spaceLimit) }} Mb):
    </the-description>
    <q-linear-progress
      stripe
      rounded
      size="20px"
      :value="usedSpace"
      :color="barColor"
      class="q-mt-sm available-space"
    >
      <div class="absolute-full flex flex-center">
        <q-badge
          color="transparent"
          class="used-space-badge"
          :label="`${(usedSpace * 100).toFixed(2)}%`"
        />
      </div>
    </q-linear-progress>
  </template>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useAuthStore } from 'src/stores/auth';
import { bytesToMegobytes } from 'src/tools';
import { computed } from 'vue';

import TheDescription from '../ui/TheDescription.vue';

const authStore = useAuthStore();

const { user } = storeToRefs(authStore);

const usedSpace = computed(() => {
  if (!user || user.value.isAnonymous) return 0;
  return user.value.usedSpace / user.value.spaceLimit;
});

const barColor = computed(() => {
  if (usedSpace.value < 0.33) {
    return 'green';
  }
  if (usedSpace.value < 0.66) {
    return 'yellow';
  }
  return 'red';
});
</script>

<style lang="scss" scoped>
.available-space {
  background: 1px solid var(--fg);
}

.used-space-badge {
  color: var(--fg);
}
</style>
