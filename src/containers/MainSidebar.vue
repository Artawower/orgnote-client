<template>
  <app-sidebar side="left" :mini="tabletAbove" :opened="opened" :resizable="tabletAbove">
    <template #mini-top>
      <app-flex class="command-list" column start align-start gap="sm">
        <command-action-button v-for="cmd of sidebarCommands" :command="cmd" :key="cmd" />
      </app-flex>
    </template>
    <template #mini-footer>
      <app-flex class="command-list" column start align-start gap="sm">
        <command-action-button v-for="cmd of footerCommands" :command="cmd" :key="cmd" />
      </app-flex>
    </template>
    <app-flex column class="content-wrapper">
      <div class="sidebar-content">
        <component :is="component" v-bind="componentConfig?.componentProps || {}" />
      </div>
      <visibility-wrapper tablet-below>
        <floating-footer>
          <app-footer v-if="opened && !mobileFileSearchActive" class="sidebar-footer" float>
            <command-action-button v-for="cmd of footerCommands" :command="cmd" :key="cmd" />
            <command-action-button :command="DefaultCommands.SHOW_MOBILE_FILE_SEARCH" />
          </app-footer>
          <div v-if="opened && mobileFileSearchActive" class="sidebar-footer-search">
            <search-input
              ref="mobileSearchInputRef"
              appearance="glass"
              v-model="searchQuery"
              :placeholder="I18N.SEARCH"
            >
              <template #actions>
                <command-action-button :command="DefaultCommands.HIDE_MOBILE_FILE_SEARCH" />
              </template>
            </search-input>
          </div>
        </floating-footer>
      </visibility-wrapper>
    </app-flex>
  </app-sidebar>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import { DefaultCommands, I18N } from 'orgnote-api';
import AppFooter from 'src/components/AppFooter.vue';
import AppSidebar from 'src/components/AppSidebar.vue';
import VisibilityWrapper from 'src/components/VisibilityWrapper.vue';
import SearchInput from 'src/components/SearchInput.vue';
import { useScreenDetection } from 'src/composables/use-screen-detection';
import CommandActionButton from 'src/containers/CommandActionButton.vue';
import AppFlex from 'src/components/AppFlex.vue';
import FloatingFooter from 'src/components/FloatingFooter.vue';
import { nextTick, ref, watch } from 'vue';

const { opened, component, componentConfig } = storeToRefs(api.ui.useSidebar());
const pinnedCommands = api.ui.usePinnedCommands();
const sidebarCommands = pinnedCommands.getCommands('sidebar');
const footerCommands = pinnedCommands.getCommands('sidebar-footer');
const { tabletAbove } = useScreenDetection();

const { searchQuery, mobileFileSearchActive } = storeToRefs(api.core.useFileManager());
const mobileSearchInputRef = ref<InstanceType<typeof SearchInput>>();

watch(mobileFileSearchActive, async (active) => {
  if (!active) return;
  await nextTick();
  mobileSearchInputRef.value?.focus();
});
</script>

<style lang="scss" scoped>
.app-sidebar {
  --scroll-bottom-padding: var(--floating-padding-bottom);
}

.footer {
  flex-direction: row-reverse;
  left: 0;
  bottom: 0;
}

.content-wrapper {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.sidebar-content {
  flex: 1;
  min-height: 0;
  width: 100%;
  overflow-y: auto;
}

.sidebar-footer {
  padding: var(--footer-wrapper-padding);
  padding-top: 0;
}

.sidebar-footer-search {
  padding: var(--footer-wrapper-padding);
  padding-top: 0;
}
</style>
