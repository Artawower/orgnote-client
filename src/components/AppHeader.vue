<template>
  <app-flex row space-between :class="{ float }" class="header-wrapper">
    <app-flex class="header" row align-center>
      <app-flex v-if="$slots.left" class="header-left float" row align-center gap="sm">
        <slot name="left" />
      </app-flex>
      <app-flex v-if="$slots.center" class="header-center float" row center align-center>
        <slot name="center">
          <app-title v-if="title" :level="5" no-margin>{{ title }}</app-title>
        </slot>
      </app-flex>
      <app-flex v-if="$slots.right" class="header-right float" row align-center end gap="sm">
        <slot name="right" />
      </app-flex>
    </app-flex>
  </app-flex>
</template>

<script lang="ts" setup>
import AppFlex from 'src/components/AppFlex.vue';
import AppTitle from 'src/components/AppTitle.vue';

defineProps<{
  title?: string;
  float?: boolean;
}>();
</script>

<style lang="scss" scoped>
.header-wrapper {
  width: 100%;
  background: var(--header-wrapper-bg);
  border-radius: var(--header-wrapper-border-radius);

  &.float {
    padding: var(--header-wrapper-padding);
  }
}

.header {
  width: 100%;
  min-height: var(--header-height);
  background: var(--header-bg);
  border: var(--header-border);
  border-radius: var(--header-border-radius);
  padding: var(--header-padding);
  box-sizing: border-box;
  position: relative;
}

.header-left,
.header-center,
.header-right {
  height: var(--header-item-height);
  background: var(--header-item-bg);
  border: var(--header-item-border);
  border-radius: var(--header-item-border-radius);
  padding: var(--header-item-padding);
  -webkit-backdrop-filter: var(--header-item-backdrop-filter);
  backdrop-filter: var(--header-item-backdrop-filter);
  background-clip: padding-box;
  box-shadow: var(--header-item-box-shadow);

  --btn-action-radius: calc(var(--header-item-border-radius) - var(--padding-md));
}

.header-left {
  flex-shrink: 0;
  margin-right: auto;
}

.header-center {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.header-right {
  flex-shrink: 0;
  margin-left: auto;
}
</style>
