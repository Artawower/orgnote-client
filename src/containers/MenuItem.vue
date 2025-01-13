<template>
  <div class="menu-item" :class="{ active }">
    <div class="left">
      <app-icon
        v-if="icon"
        :name="icon"
        :background="active ? 'accent' : 'fg'"
        color="bg"
        :rounded="true"
      ></app-icon>
      <div class="content">
        <slot />
      </div>
    </div>
    <app-icon v-if="narrow" name="sym_o_arrow_forward_ios" />
  </div>
</template>

<script lang="ts" setup>
import AppIcon from 'src/components/AppIcon.vue';

defineProps<{
  icon?: string;
  narrow?: boolean;
  active?: boolean;
}>();
</script>

<style lang="scss" scoped>
.menu-item {
  @include flexify(row, space-between, center);
  cursor: pointer;
  padding: var(--menu-item-padding);
  height: var(--menu-item-height);
  max-height: var(--menu-item-height);

  &:hover,
  &:active {
    background-color: var(--menu-item-hover-bg);
  }
}

.left {
  @include flexify(row, flex-start, center, var(--gap-sm));
}

.content {
  padding-left: var(--menu-item-padding);
}

.active {
  color: var(--accent);
}
</style>
