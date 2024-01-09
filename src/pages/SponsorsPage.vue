<template>
  <div class="q-pa-md">
    <h3 class="q-mb-md color-magenta">{{ $t('sponsors') }}</h3>

    <div class="few-words">
      {{ $t('sponsors.appretiate') }}
    </div>

    <div class="sponsors">
      <component
        v-for="sponsor in sponsorsStore.sponsors"
        :is="sponsor.link ? 'a' : 'p'"
        :href="sponsor.link ?? undefined"
        target="_blank"
        class="sponsor color-magic"
        :class="sponsor.link ? 'active' : ''"
        :key="sponsor.name"
      >
        {{ sponsor.name }}
      </component>
    </div>

    <div class="capitalize color-secondary text-center text-italic">
      {{ $t('you name could be here') }}
    </div>
    <donation-links />
  </div>
</template>

<script lang="ts">
export default {
  name: 'SponsorsPage',
};
</script>

<script lang="ts" setup>
import { useSponsorsStore } from 'src/stores/sponsors';
import { onBeforeMount } from 'vue';

import DonationLinks from 'src/components/containers/DonationLinks.vue';

const sponsorsStore = useSponsorsStore();
onBeforeMount(() => {
  sponsorsStore.loadSponsors();
});
</script>

<style lang="scss" scoped>
.sponsors,
.few-words {
  padding: var(--block-padding-md);
}
.sponsor {
  font-size: var(--font-md);
}
</style>
