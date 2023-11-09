<template>
  <div
    v-if="$q.platform.is.mobile && !$q.platform.is.cordova"
    @touchmove.stop="touchMove"
    @touchstart.stop="touchStart"
    class="prevent-touch"
  >
    <slot />
  </div>
  <template v-else>
    <slot />
  </template>
</template>

<script lang="ts" setup>
// NOTE: this fucking crutch should solve (or just hide)
// this AMAZING feature for ios device
// more details here: https://stackoverflow.com/a/66393991
// if someone know how to do it better - let me know
import { useQuasar } from 'quasar';

const $q = useQuasar();
let startY = 0;
let startX = 0;

const touchStart = (e: TouchEvent) => {
  startY = e.touches[0].clientY;
  startX = e.touches[0].clientX;
};
const touchMove = (e: TouchEvent) => {
  const isVertical = Math.abs(e.changedTouches[0].clientY - startY) > 15;
  const isHorizontal = Math.abs(e.changedTouches[0].clientX - startX) > 5;
  if (
    (isVertical || !isHorizontal) &&
    $q.platform.is.ios &&
    !$q.platform.is.cordova
  ) {
    e.preventDefault();
    return;
  }
};
</script>

<style lang="scss" scoped>
.prevent-touch {
  width: 100%;
}
</style>
