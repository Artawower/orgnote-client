<template>
  <div class="download-links">
    <a :href="apkUrl" target="_blank">
      <img src="~assets/google-play.svg" height="26" />
    </a>
  </div>
</template>

<script lang="ts" setup>
import { version } from '../../package.json';

const apkUrl = `/builds/second-brain-${version}.apk`;
</script>

<style lang="scss">
.download-links {
  @include flexify(row, center, center);
  width: 100%;
}
</style>
