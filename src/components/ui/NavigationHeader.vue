<template>
  <div class="mob-navigation-header color-blue">
    <arrow-back v-if="$q.platform.is.mobile" />
    <div
      class="full-width color-main text-bold capitalize"
      :class="{
        'text-center': $q.platform.is.mobile,
        'text-h5': $q.platform.is.desktop,
      }"
    >
      {{ navBarStore.title }}
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useNavBarStore } from 'src/stores/nav-bar.store';
import ArrowBack from './ArrowBack.vue';
const navBarStore = useNavBarStore();
</script>

<style lang="scss">
.mob-navigation-header {
  @include flexify(row, flex-start, center, var(--gap-sm));
  padding: var(--block-padding-md);
}
</style>
