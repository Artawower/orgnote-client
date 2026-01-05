<template>
  <div :class="{ float }" class="footer-wrapper">
    <app-flex class="footer" row :justify="props.justify">
      <slot />
    </app-flex>
  </div>
</template>

<script lang="ts" setup>
import AppFlex from 'src/components/AppFlex.vue';

type FlexJustify = InstanceType<typeof AppFlex>['$props']['justify'];

const props = withDefaults(
  defineProps<{
    justify?: FlexJustify;
    float?: boolean;
  }>(),
  {
    justify: 'center',
  },
);
</script>

<style lang="scss" scoped>
.footer-wrapper {
  & {
    width: 100%;
  }
}

.float {
  padding: var(--footer-wrapper-padding);
}

.footer {
  & {
    width: 100%;
    min-height: var(--footer-height);
    background: var(--footer-bg);
    border-top: var(--footer-border-top);
    padding: var(--footer-padding);
    border-radius: var(--footer-border-radius);
    box-sizing: border-box;
  }

  body.keyboard-opened & {
    padding-bottom: var(--footer-padding-bottom, 0px);
  }
}
</style>
