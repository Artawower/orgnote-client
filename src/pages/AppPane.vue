<template>
  <visibility-wrapper>
    <template #desktop-above>
      <nav-tabs>
        <nav-tab icon="description">My note</nav-tab>
      </nav-tabs>
    </template>
  </visibility-wrapper>
  <component :is="currentView" />
</template>

<script lang="ts" setup>
import { api } from 'src/boot/api';
import NavTab from 'src/components/NavTab.vue';
import NavTabs from 'src/components/NavTabs.vue';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';
import { computed } from 'vue';

const props = defineProps<{
  paneId: string;
}>();

const pane = api.core.usePane();
const currentPane = computed(() => pane.getPane(props.paneId));

const router = computed(() => currentPane.value.pages[currentPane.value.activePageId].router);
router.value.push('/');

const currentRoute = computed(() => router.value.currentRoute.value);

const currentView = computed(() => {
  return currentRoute.value?.matched[0]?.components?.default;
});
</script>
