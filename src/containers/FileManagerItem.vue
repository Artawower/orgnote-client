<template>
  <context-menu
    :group="contextMenuGroup"
    :data="{ path: file?.path }"
    :disabled="isSystemPath"
    @open="handleContextMenuOpen"
  >
    <menu-item :size="size" :active="active">
      <app-flex class="file-info" row start align-center gap="sm">
        <app-icon
          :name="file?.type === 'directory' || root ? 'sym_o_folder' : 'sym_o_draft'"
          size="sm"
        />
        <div class="name">
          <span v-if="root"> .. </span>
          <template v-else>
            <highlighter
              class="my-highlight"
              highlightClassName="highlight"
              :searchWords="highlight ?? []"
              :autoEscape="true"
              :textToHighlight="file?.name ?? ''"
            />
            <q-tooltip :delay="tooltipDelay">{{ file?.name }}</q-tooltip>
          </template>
        </div>
      </app-flex>
    </menu-item>
  </context-menu>
</template>

<script lang="ts" setup>
import type { MenuGroup, StyleSize } from 'orgnote-api';
import type { DiskFile } from 'orgnote-api';
import AppIcon from 'src/components/AppIcon.vue';
import MenuItem from './MenuItem.vue';
import Highlighter from 'vue-highlight-words';
import ContextMenu from 'src/components/ContextMenu.vue';
import { computed } from 'vue';
import { ROOT_SYSTEM_FILE_PATH } from 'src/constants/root-system-file-path';
import { api } from 'src/boot/api';
import AppFlex from 'src/components/AppFlex.vue';
import { useConfigStore } from 'src/stores/config';
import { storeToRefs } from 'pinia';

const props = defineProps<{
  highlight?: string[];
  file?: DiskFile;
  root?: boolean;
  size?: StyleSize;
  active?: boolean;
}>();

const fm = api.core.useFileManager();
const { config } = storeToRefs(useConfigStore());
const tooltipDelay = computed(() => config.value.ui.tooltipDelay);

const contextMenuGroup = computed<MenuGroup>(() =>
  props.file?.type === 'directory' ? 'dir' : 'file',
);

const isSystemPath = computed(() => props.file?.path?.startsWith(`/${ROOT_SYSTEM_FILE_PATH}`));

const handleContextMenuOpen = () => {
  if (!props.file) {
    return;
  }
  fm.focusFile = props.file;
};
</script>

<style lang="scss" scoped>
:deep(.left) {
  overflow: hidden;
}

.file-info {
  min-width: 0;
  overflow: hidden;
}

.name {
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
