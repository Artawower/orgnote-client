<template>
  <div class="flex cols">
    <q-list class="tabs">
      <q-item
        v-for="tab of tabs"
        @click="openTab(tab.component)"
        :disable="tab?.disabled"
        :key="tab.name"
        :active="activeComponent === tab.component"
        clickable
        class="rounded-borders justify-start"
      >
        <q-item-section :avatar="$q.screen.gt.xs">
          <q-icon :name="tab.icon" size="sm" />
        </q-item-section>
        <q-item-section v-if="$q.screen.gt.xs">
          <q-item-label class="text-capitalize">{{
            $t(tab.name)
          }}</q-item-label>
        </q-item-section>
      </q-item>
      <slot name="custom-tabs" />
    </q-list>
    <div class="active-tab">
      <component :is="activeComponent"></component>
    </div>
  </div>
</template>

<script lang="ts">
export interface Tab {
  name: string;
  icon: string;
  component: VueComponent;
  disabled?: boolean;
}
</script>

<script lang="ts" setup>
import { VueComponent } from 'src/models';

import { shallowRef } from 'vue';

const props = defineProps<{
  tabs: Tab[];
}>();

const activeComponent = shallowRef<VueComponent>(props.tabs[0].component);

const openTab = (component: VueComponent) => {
  activeComponent.value = component;
};
</script>

<style lang="scss" scoped>
.tabs {
  width: auto;
}
.active-tab {
  flex: 1;
  padding: var(--default-block-padding);
}
</style>
