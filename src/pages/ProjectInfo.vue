<template>
  <div class="project-info">
    <component-tabs :tabs="tabs">
      <template v-slot:custom-tabs>
        <q-item
          href="https://github.com/Artawower/orgnote/wiki/General"
          target="_blank"
        >
          <q-item-section :avatar="$q.screen.gt.xs">
            <q-icon name="quiz" size="sm" />
          </q-item-section>
          <q-item-section> WIKI </q-item-section>
        </q-item>
      </template>
    </component-tabs>
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

<style lang="scss">
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
