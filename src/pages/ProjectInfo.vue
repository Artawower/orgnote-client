<template>
  <div class="project-info">
    <component-tabs :tabs="tabs" />
  </div>
</template>

<script lang="ts" setup>
import ComponentTabs from 'src/components/ui/ComponentTabs.vue';
import { Tab } from 'src/components/ui/ComponentTabs.vue';
import AboutOrgRoamPage from 'src/pages/AboutOrgRoamPage.vue';
import AcknowledgementsPage from 'src/pages/AcknowledgementsPage.vue';
import SponsorsPage from 'src/pages/SponsorsPage.vue';

const tabs: Tab[] = [
  {
    component: AboutOrgRoamPage,
    icon: 'o_info',
    name: 'info',
  },
  {
    component: AcknowledgementsPage,
    name: 'acknowledgements',
    icon: 'add_reaction',
  },
  {
    component: SponsorsPage,
    icon: 'monetization_on',
    name: 'sponsors',
  },
];
</script>

<style>
.project-info {
  .active-tab {
    max-height: calc(
      var(--modal-max-height) - (var(--default-block-padding) * 2)
    );
    height: calc(var(--modal-max-height) - (var(--default-block-padding) * 2));
    overflow: auto;
  }
}
</style>
