<template>
  <visibility-wrapper>
    <template #desktop-above>
      <nav-tabs>
        <nav-tab
          v-for="(page, i) of Object.values(activePane.pages)"
          @click="pane.selectPage(activePane.id, page.id)"
          @close="pane.closePage(activePane.id, page.id)"
          icon="description"
          :key="i"
          :active="page.id === activePane.activePageId"
        >
          {{ page.title }}
        </nav-tab>
        <template #actions>
          <command-action-button :command="DefaultCommands.NEW_PAGE" size="sm" />
        </template>
      </nav-tabs>
    </template>
  </visibility-wrapper>
  <component :is="currentView" />
</template>

<script lang="ts" setup>
import { DefaultCommands } from 'orgnote-api';
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import NavTab from 'src/components/NavTab.vue';
import NavTabs from 'src/components/NavTabs.vue';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';
import CommandActionButton from 'src/containers/CommandActionButton.vue';
import { computed } from 'vue';

const props = defineProps<{
  paneId: string;
}>();

const pane = api.core.usePane();
const { activePane } = storeToRefs(pane);
const currentPane = computed(() => pane.getPane(props.paneId));

const router = computed(() => currentPane.value.pages[currentPane.value.activePageId].router);

const currentRoute = computed(() => router.value.currentRoute.value);

const currentView = computed(() => {
  return currentRoute.value?.matched[0]?.components?.default;
});
</script>
