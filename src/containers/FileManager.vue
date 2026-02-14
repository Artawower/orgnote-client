<template>
  <app-flex class="file-manager" :class="{ compact }" column start align-start gap="md">
    <div class="actions">
      <action-buttons horizontal :position="compact ? 'left' : 'right'">
        <action-button
          @click="emits('dirPicked', targetPath)"
          v-if="pickDir"
          icon="sym_o_folder_check_2"
        >
          <template #text>{{ t(I18N.PICK_FOLDER) }}</template>
        </action-button>

        <command-action-button
          v-if="compact"
          :command="DefaultCommands.MAXIMIZE_FILE_MANAGER"
          :size="iconSize"
        >
        </command-action-button>
        <command-action-button
          v-if="!compact"
          :command="DefaultCommands.CREATE_NOTE"
          :size="iconSize"
        ></command-action-button>
        <command-action-button :command="DefaultCommands.CREATE_FOLDER" :size="iconSize">
        </command-action-button>
        <action-button @click="emits('close')" v-if="closable" icon="close" :size="iconSize" />
      </action-buttons>
    </div>
    <div class="file-manager-wrapper">
      <div class="file-manager-header">
        <card-wrapper>
          <menu-item v-if="showHeaderSearch" :size="menuItemSize">
            <search-input
              :size="compact ? 'xs' : 'sm'"
              v-model="searchQuery"
              :placeholder="I18N.SEARCH"
            />
          </menu-item>
          <menu-item :size="menuItemSize">
            <app-flex class="file-path" row start align-center>
              {{ targetPath ?? '/' }}
            </app-flex>
          </menu-item>
        </card-wrapper>
      </div>
      <div class="file-list">
        <card-wrapper>
          <file-manager-item
            v-if="targetPath && targetPath !== '/'"
            @click="moveUp"
            root
            :size="menuItemSize"
          />
          <file-manager-item
            :highlight="searchHighlightKeywords"
            @click="handleFileClick(f)"
            v-for="f of searchFiles"
            :key="f.path"
            :file="f"
            :size="menuItemSize"
            :active="isActiveFile(f)"
          />
        </card-wrapper>
      </div>
    </div>
  </app-flex>
</template>

<script lang="ts" setup>
import type { StyleSize } from 'orgnote-api';
import { DefaultCommands, getParentDir, I18N, join, parseBufferUri, withRoot } from 'orgnote-api';
import type { DiskFile } from 'orgnote-api';
import { api } from 'src/boot/api';
import FileManagerItem from './FileManagerItem.vue';
import MenuItem from './MenuItem.vue';
import SearchInput from 'src/components/SearchInput.vue';
import ActionButtons from 'src/components/ActionButtons.vue';
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import CommandActionButton from './CommandActionButton.vue';
import ActionButton from 'src/components/ActionButton.vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import { extractPathFromRoute } from 'src/utils/extract-path-from-route';
import AppFlex from 'src/components/AppFlex.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import { debounce } from 'src/utils/debounce';

const props = defineProps<{
  path?: string;
  tree?: boolean;
  compact?: boolean;
  pickDir?: boolean;
  closable?: boolean;
}>();

const emits = defineEmits<{
  (e: 'close'): void;
  (e: 'dirPicked', path: string): void;
}>();

const menuItemSize = computed(() => (props.compact ? 'md' : 'auto'));

const { path: targetPath, searchQuery } = storeToRefs(api.core.useFileManager());
if (props.path) {
  targetPath.value = props.path;
}
const fs = api.core.useFileSystem();

const files = ref<DiskFile[]>([]);
const searchHighlightKeywords = computed(() => searchQuery.value.split(' '));
const searchFiles = computed(() =>
  files.value.filter((f) =>
    searchQuery.value ? f.name.toLowerCase().includes(searchQuery.value) : files.value,
  ),
);

const readDir = async () => {
  files.value = await fs.readDir(targetPath.value);
};

const refreshFiles = debounce(() => void readDir(), 100);
const fileWatcher = api.core.useFileWatcher();

let unwatchTargetDir: (() => void) | undefined;

const watchTargetDir = (path: string): void => {
  unwatchTargetDir?.();
  unwatchTargetDir = fileWatcher.watch(path, () => refreshFiles(), { recursive: false });
};

watch(
  targetPath,
  async (path) => {
    watchTargetDir(path);
    await readDir();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  unwatchTargetDir?.();
  refreshFiles.cancel();
});

const bufferViewer = api.core.useBufferViewer();
const sidebar = api.ui.useSidebar();
const paneStore = api.core.usePane();

const handleFileClick = async (f: DiskFile) => {
  if (f.type === 'directory') {
    targetPath.value = withRoot(join(targetPath.value, f.name));
    await readDir();
    return;
  }

  bufferViewer.open(f.path);
  closeMobileSidebar();
};

const { tabletBelow } = api.ui.useScreenDetection();

const showHeaderSearch = computed(() => !props.compact || !tabletBelow.value);

const closeMobileSidebar = () => {
  if (tabletBelow.value) {
    sidebar.close();
  }
};

const moveUp = async () => {
  targetPath.value = withRoot(getParentDir(targetPath.value));
  await readDir();
};

const iconSize = computed<StyleSize>(() => (props.compact ? 'sm' : 'md'));

const activeFilePath = computed<string | undefined>(() => {
  const activeTab = paneStore.activeTab;
  if (!activeTab?.router) return;

  const route = activeTab.router.currentRoute.value;
  const uri = extractPathFromRoute(route);
  if (!uri) return;
  return parseBufferUri(uri).path;
});

const isActiveFile = (file: DiskFile): boolean => {
  if (file.type !== 'file' || !activeFilePath.value) return false;
  return file.path === activeFilePath.value;
};

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>

<style lang="scss" scoped>
.actions,
.file-manager-header,
.file-list {
  padding: 0 var(--padding-lg);
}

.file-list {
  padding-bottom: var(--scroll-bottom-padding, 0);
}

.file-manager-wrapper {
  @include flexify(column, flex-start, center, var(--gap-md));

  overflow: hidden;
}

.file-manager {
  & {
    @include fit;
  }

  div {
    width: 100%;
  }
}

.file-list {
  overflow: auto;

  :deep(.card-wrapper) {
    overflow: hidden;
  }
}

.file-path {
  & {
    height: 100%;
    color: var(--fg-muted);
    flex: 1;
  }
}
</style>
