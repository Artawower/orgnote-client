<template>
  <page-wrapper>
    <main-sidebar />
    <div class="content">
      <router-view />
    </div>
    <the-footer />
  </page-wrapper>
</template>

<script setup lang="ts">
import TheFooter from 'src/containers/TheFooter.vue';
import PageWrapper from 'src/components/PageWrapper.vue';
import MainSidebar from 'src/containers/MainSidebar.vue';
</script>
