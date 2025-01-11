<template>
  <div class="footer">
    <slot />
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.footer {
  @include flexify(row, center, center);

  width: 100%;
  height: var(--footer-height);
  background: var(--footer-background);
  border-top: var(--footer-border-top);
  padding: var(--footer-padding);
  padding-bottom: calc(var(--footer-padding-bottom, 0px) + var(--device-padding-bottom));
  position: absolute;
  bottom: 0;
  box-sizing: content-box;
}
</style>
