<template>
  <div class="buffer-content">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.buffer-content {
  height: 100%;
  box-sizing: border-box;

  @include tablet-below {
    padding-top: var(--main-header-total-height);
    padding-bottom: var(--floating-padding-bottom);
  }
}
</style>
