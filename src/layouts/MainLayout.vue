<template>
  <page-wrapper>
    <main-sidebar />
    <div class="content">
      <router-view />
      <the-footer />
    </div>
  </page-wrapper>
</template>

<script setup lang="ts">
import TheFooter from 'src/containers/TheFooter.vue';
import PageWrapper from 'src/components/PageWrapper.vue';
import MainSidebar from 'src/containers/MainSidebar.vue';
</script>

<style lang="scss" scoped>
.content {
  position: relative;
  height: 100vh;
  height: 100dvh;
  flex: 1;
}
</style>
