<template>
  <container-layout
    v-if="currentPane"
    class="pane-container"
    :body-scroll="false"
    @click="handlePaneClick"
  >
    <template #header>
      <visibility-wrapper>
        <template #desktop-above>
          <nav-tabs>
            <template #navigation>
              <action-button
                icon="keyboard_arrow_left"
                size="sm"
                color="fg-muted"
                :disabled="!canGoBack"
                @click="handleNavigation('back')"
              />
              <action-button
                icon="keyboard_arrow_right"
                size="sm"
                color="fg-muted"
                :disabled="!canGoForward"
                @click="handleNavigation('forward')"
              />
            </template>
            <nav-tab
              v-for="tab of tabs"
              @click="handleTabSelect(tab.id)"
              @close="handleTabClose(tab.id)"
              @dragstart="handleDragStart"
              @dragend="handleDragEnd"
              icon="description"
              :key="tab.id"
              :active="isTabActive(tab.id)"
              :tab-id="tab.id"
              :pane-id="props.paneId"
            >
              {{ generateTabTitle(tab.router.currentRoute.value) || tab.title }}
            </nav-tab>
            <template #actions>
              <command-action-button
                :command="DefaultCommands.NEW_TAB"
                size="sm"
                :data="{ paneId: props.paneId }"
              />
            </template>
            <template v-if="isTopRightPane" #right-actions>
              <command-action-button
                v-if="!opened"
                :command="DefaultCommands.TOGGLE_RIGHT_SIDEBAR"
                size="sm"
              />
            </template>
          </nav-tabs>
        </template>
        <template #mobile>
          <div class="mobile-tab-header">
            <action-button
              v-if="canGoBack"
              icon="keyboard_arrow_left"
              size="sm"
              color="fg-muted"
              @click="handleNavigation('back')"
            />
            <action-button
              v-if="canGoForward"
              icon="keyboard_arrow_right"
              size="sm"
              color="fg-muted"
              @click="handleNavigation('forward')"
            />
            <div class="mobile-tab-title">
              {{
                activeTab?.router.currentRoute.value
                  ? generateTabTitle(activeTab.router.currentRoute.value)
                  : activeTab?.title
              }}
            </div>
            <command-action-button :command="DefaultCommands.SHOW_TAB_SWITCHER" size="sm" />
            <command-action-button
              :command="DefaultCommands.NEW_TAB"
              size="sm"
              :data="{ paneId: props.paneId }"
            />
          </div>
        </template>
      </visibility-wrapper>
    </template>

    <template #body>
      <ScopedRouterView v-if="resolvedRouter" :router="resolvedRouter" :key="activeTabId || ''" />
    </template>

    <drop-zone-overlay
      :visible="pane.isDraggingTab"
      v-model:active-zone="currentDropZone"
      @drop="handleDrop"
    />
  </container-layout>
</template>

<script lang="ts" setup>
import { DefaultCommands } from 'orgnote-api';
import { type DropDirection, type DropZone, type Tab } from 'orgnote-api';
import { api } from 'src/boot/api';
import ActionButton from 'src/components/ActionButton.vue';
import NavTab from 'src/components/NavTab.vue';
import NavTabs from 'src/components/NavTabs.vue';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';
import DropZoneOverlay from 'src/components/DropZoneOverlay.vue';
import CommandActionButton from 'src/containers/CommandActionButton.vue';
import { generateTabTitle } from 'src/utils/generate-tab-title';
import { shallowRef, ref } from 'vue';
import { provide } from 'vue';
import { computed, watch } from 'vue';
import type { Router } from 'vue-router';

import ScopedRouterView from 'src/components/ScopedRouterView.vue';
import { TAB_ROUTER_KEY } from 'src/constants/context-providers';
import { storeToRefs } from 'pinia';
import ContainerLayout from 'src/components/ContainerLayout.vue';
import { useTabHistory } from 'src/composables/use-tab-history';

const props = defineProps<{
  paneId: string;
}>();

const pane = api.core.usePane();
const layout = api.core.useLayout();

const currentPane = computed(() => {
  const paneRef = pane.panes?.[props.paneId];
  return paneRef?.value;
});

const tabs = computed((): Tab[] => {
  if (!currentPane.value) return [];
  return Object.values(currentPane.value.tabs.value);
});

const activeTab = computed<Tab | undefined>(() => {
  const tabId = currentPane.value?.activeTabId;
  return currentPane.value?.tabs.value[tabId!];
});

const activeTabId = computed(() => {
  const id = currentPane.value?.activeTabId;
  return id;
});

const isPaneActive = computed(() => {
  return pane.activePaneId === props.paneId;
});

const isSinglePane = computed(() => Object.keys(pane.panes).length === 1);

const isTopRightPane = computed(() => {
  if (isSinglePane.value) return true;
  const position = layout.getPanePosition(props.paneId);
  return position?.horizontal === 'right' && position?.vertical !== 'bottom';
});

const isTabActive = (tabId: string): boolean => {
  return tabId === activeTabId.value && isPaneActive.value;
};

const handlePaneClick = () => {
  if (!currentPane.value) return;
  if (pane.activePaneId !== currentPane.value.id) {
    pane.setActivePane(currentPane.value.id);
  }
};

const handleTabSelect = (tabId: string) => {
  if (!currentPane.value) return;
  pane.selectTab(currentPane.value.id, tabId);
};

const handleTabClose = (tabId: string) => {
  if (!currentPane.value) return;
  pane.closeTab(currentPane.value.id, tabId);
};

const currentDropZone = ref<DropZone | undefined>();

const tabRouter = shallowRef<Router | undefined>();
const resolvedRouter = computed(() => tabRouter.value as Router | undefined);

const initTabRouter = () => {
  const tab = activeTab.value;
  if (!tab?.router) {
    tabRouter.value = undefined;
    return;
  }
  tabRouter.value = tab.router;
};

initTabRouter();

watch(activeTab, initTabRouter, { immediate: true });

provide(TAB_ROUTER_KEY, tabRouter);

const { canGoBack, canGoForward, handleNavigation } = useTabHistory(tabRouter);

const handleDragStart = (payload: { tabId: string; paneId: string }) => {
  setTimeout(() => {
    pane.startDraggingTab(payload.tabId, payload.paneId);
  }, 0);
};

const handleDragEnd = () => {
  pane.stopDraggingTab();
  currentDropZone.value = undefined;
};

const shouldMoveTabToPane = (sourcePaneId: string, targetPaneId: string): boolean =>
  sourcePaneId !== targetPaneId;

const moveTabToCenter = async (tabId: string, sourcePaneId: string): Promise<void> => {
  if (!shouldMoveTabToPane(sourcePaneId, props.paneId)) return;
  await pane.moveTab(tabId, sourcePaneId, props.paneId);
};

const moveTabToNewPane = async (
  tabId: string,
  sourcePaneId: string,
  newPaneId: string,
): Promise<void> => {
  await pane.moveTab(tabId, sourcePaneId, newPaneId);
};

const createNewPaneAndMoveTab = async (
  direction: DropDirection,
  tabId: string,
  sourcePaneId: string,
): Promise<void> => {
  const newPaneId = await layout.splitPaneInLayout(props.paneId, direction, false);
  if (!newPaneId) return;
  await moveTabToNewPane(tabId, sourcePaneId, newPaneId);
};

const handleCenterDrop = async (tabId: string, sourcePaneId: string): Promise<void> => {
  await moveTabToCenter(tabId, sourcePaneId);
  handleDragEnd();
};

const handleDirectionDrop = async (
  zone: DropDirection,
  tabId: string,
  sourcePaneId: string,
): Promise<void> => {
  await createNewPaneAndMoveTab(zone, tabId, sourcePaneId);
  handleDragEnd();
};

const handleTabDrop = async (
  zone: DropZone,
  tabId: string,
  sourcePaneId: string,
): Promise<void> => {
  if (zone === 'center') {
    await handleCenterDrop(tabId, sourcePaneId);
    return;
  }

  await handleDirectionDrop(zone as DropDirection, tabId, sourcePaneId);
};

const handleDrop = async (zone: DropZone): Promise<void> => {
  if (pane.draggedTabData) {
    const { tabId, paneId: sourcePaneId } = pane.draggedTabData;
    await handleTabDrop(zone, tabId, sourcePaneId);
    return;
  }
};

const { opened } = storeToRefs(api.ui.useRightSidebar());
</script>

<style scoped>
.pane-container {
  position: relative;
}

.mobile-tab-header {
  display: flex;
  align-items: center;
  gap: var(--gap-sm);
  padding: var(--padding-sm) var(--padding-md);
  background: var(--bg);
  border-bottom: 1px solid var(--border-color);
}

.mobile-tab-title {
  flex: 1;
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  color: var(--fg);
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
