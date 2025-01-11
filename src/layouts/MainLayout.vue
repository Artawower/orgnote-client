<template>
  <page-wrapper>
    <main-sidebar />
    <div class="content">
      <router-view />
      <platform-specific mobile ios android>
        <the-footer />
      </platform-specific>
    </div>
  </page-wrapper>
</template>

<script setup lang="ts">
import TheFooter from 'src/containers/TheFooter.vue';
import PageWrapper from 'src/components/PageWrapper.vue';
import MainSidebar from 'src/containers/MainSidebar.vue';
import PlatformSpecific from 'src/components/PlatformSpecific.vue';
</script>

<style lang="scss" scoped>
.content {
  position: relative;
  height: 100vh;
  height: 100dvh;
  flex: 1;
}
</style>
