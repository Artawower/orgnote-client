<template>
  <div class="scaffold" :class="{ 'has-header': $slots.header, 'has-footer': $slots.footer }">
    <div v-if="$slots.header" class="panel top">
      <slot name="header" />
    </div>

    <div class="content">
      <slot />
    </div>

    <div v-if="$slots.footer" class="panel bottom">
      <slot name="footer" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.scaffold {
  position: relative;
  height: 100%;

  --scaffold-header-height: 0px;
  --scaffold-footer-height: 0px;

  &.has-header {
    --scaffold-header-height: var(--floating-header-height);
  }

  &.has-footer {
    --scaffold-footer-height: var(--floating-footer-height);
  }
}

.content {
  height: 100%;
  overflow-y: auto;
}

.panel {
  position: absolute;
  left: 0;
  right: 0;

  &.top {
    top: 0;
  }

  &.bottom {
    bottom: 0;
  }
}
</style>
