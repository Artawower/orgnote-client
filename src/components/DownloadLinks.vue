<template>
  <div class="download-links">
    <a href="/builds/second-brain.apk" target="_blank">
      <img src="~assets/google-play.svg" height="26" />
    </a>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss">
.download-links {
  @include flexify(row, center, center);
  width: 100%;
}
</style>
