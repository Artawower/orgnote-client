<template>
  <div class="navigation-header color-blue" ref="navigationHeaderRef">
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
import { ref } from 'vue';
import { onMounted } from 'vue';
const navBarStore = useNavBarStore();

const navigationHeaderRef = ref<HTMLElement | null>(null);
const observer = new IntersectionObserver(
  ([e]) => {
    console.log('[line 26]: e', e);
    e.target.classList.toggle('pinned', e.intersectionRatio < 1);
  },
  { threshold: [1] }
);

onMounted(() => {
  observer.observe(navigationHeaderRef.value);
});
</script>

<style lang="scss">
.navigation-header {
  @include flexify(row, flex-start, center, var(--gap-sm));
  @include sticky-header();
  background: var(--bg);
  padding: var(--block-padding-md);

  &.pinned {
    border-bottom: var(--border-secondary);
  }
}
</style>
