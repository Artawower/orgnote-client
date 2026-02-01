<template>
  <div class="floating-footer">
    <slot />
  </div>
</template>

<style lang="scss" scoped>
.floating-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
}
</style>
