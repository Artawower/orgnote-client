<template>
  <app-flex row center align-center full-height class="page">
    <content-frame :padding="padding" :constrained="constrained" justify="between" full-height>
      <slot />
    </content-frame>
  </app-flex>
</template>

<script lang="ts" setup>
import AppFlex from 'src/components/AppFlex.vue';
import ContentFrame from 'src/components/ContentFrame.vue';

defineProps<{
  padding?: boolean;
  constrained?: boolean;
  centered?: boolean;
}>();
</script>

<style lang="scss" scoped>
.page {
  @include fit();

  & {
    --content-frame-padding: var(--page-padding);
    --content-frame-max-width: var(--page-max-width);

    background: var(--bg);
    position: relative;
  }
}
</style>
