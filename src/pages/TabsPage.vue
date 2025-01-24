<template>
  <visibility-wrapper>
    <template #desktop-above>
      <nav-tabs>
        <nav-tab icon="description">My note</nav-tab>
      </nav-tabs>
    </template>
  </visibility-wrapper>
  <initial-tab-page />
</template>

<script lang="ts" setup>
import NavTab from 'src/components/NavTab.vue';
import NavTabs from 'src/components/NavTabs.vue';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';
import InitialTabPage from './InitialTabPage.vue';
</script>
