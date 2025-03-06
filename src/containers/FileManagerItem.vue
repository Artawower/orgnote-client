<template>
  <menu-item @contextmenu.stop.prevent="openContextMenu()" :size="size">
    <div class="file-info" ref="fileManageItemRef">
      <app-icon
        :name="file?.type === 'directory' || root ? 'sym_o_folder' : 'sym_o_draft'"
        color="fg-alt"
        size="sm"
      />
      <div class="name">
        <span v-if="root"> .. </span>
        <template v-else>
          <highlighter
            class="my-highlight"
            highlightClassName="highlight"
            :searchWords="highlight"
            :autoEscape="true"
            :textToHighlight="file?.name"
          />
        </template>
      </div>

      <context-menu
        v-if="!file?.path?.startsWith(`/${rootSystemFilePath}`)"
        :items="actionItems"
        ref="contextMenuRef"
        :target="fileManageItemRef"
        :data="file?.path"
      />
    </div>
  </menu-item>
</template>

<script lang="ts" setup>
import type { CommandName } from 'orgnote-api';
import { DefaultCommands, type DiskFile } from 'orgnote-api';
import AppIcon from 'src/components/AppIcon.vue';
import MenuItem from './MenuItem.vue';
import Highlighter from 'vue-highlight-words';
import type { ViewSize } from 'src/models/view-size';
import ContextMenu from 'src/components/ContextMenu.vue';
import { computed, ref } from 'vue';
import { rootSystemFilePath } from 'src/constants/root-system-file-path';
import { api } from 'src/boot/api';

const props = defineProps<{
  highlight?: string[];
  file?: DiskFile;
  root?: boolean;
  size?: ViewSize;
}>();

const contextMenuRef = ref<InstanceType<typeof ContextMenu>>();
const fileManageItemRef = ref<HTMLElement>();

const fm = api.core.useFileManager();

const openContextMenu = () => {
  if (!props.file) {
    return;
  }
  fm.focusFile = props.file;
  contextMenuRef.value?.open();
};

const actionItems = computed<CommandName[]>(() => {
  const items: CommandName[] = [
    DefaultCommands.CREATE_FILE,
    DefaultCommands.DELETE_FILE,
    DefaultCommands.RENAME_FILE,
  ];

  if (props.file?.type === 'directory') {
    items.unshift(DefaultCommands.CREATE_FOLDER);
  }

  return items;
});
</script>

<style lang="scss" scoped>
.file-info {
  @include flexify(row, flex-start, center, var(--gap-sm));
}
</style>
