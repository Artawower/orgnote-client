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
    height: var(--footer-height);
    background: var(--footer-bg);
    border-top: var(--footer-border-top);
    padding: var(--footer-padding);
    padding-bottom: calc(var(--footer-padding-bottom, 0px) + var(--device-padding-bottom));
    position: absolute;
    bottom: 0;
    box-sizing: border-box;
  }
}
</style>
