<template>
  <div class="download-links">
    <a
      v-if="!$q.platform.is.nativeMobile && !$q.platform.is.ios"
      :href="apkUrl"
      target="_blank"
    >
      <img src="~assets/google-play.svg" height="26" />
    </a>
  </div>
</template>

<script lang="ts" setup>
const apkUrl = 'https://play.google.com/store/apps/details?id=org.note.app';
</script>

<style lang="scss">
.download-links {
  @include flexify(row, center, center);
  width: 100%;
}
</style>
