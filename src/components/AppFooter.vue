<template>
  <app-flex class="footer" row align-center :justify="props.justify">
    <slot />
  </app-flex>
</template>

<script lang="ts" setup>
import AppFlex from 'src/components/AppFlex.vue';

type FlexJustify = InstanceType<typeof AppFlex>['$props']['justify'];

const props = withDefaults(
  defineProps<{
    justify?: FlexJustify;
  }>(),
  {
    justify: 'center',
  },
);
</script>

<style lang="scss" scoped>
.footer {
  & {
    width: 100%;
    min-height: var(--footer-height);
    background: var(--footer-bg);
    border-top: var(--footer-border-top);
    padding: var(--footer-padding);
    padding-bottom: calc(
      var(--footer-padding-bottom, 0px) + max(env(safe-area-inset-bottom, 0px), var(--device-padding-bottom))
    );
    box-sizing: border-box;
  }

  body.keyboard-opened & {
    padding-bottom: var(--footer-padding-bottom, 0px);
  }
}
</style>
