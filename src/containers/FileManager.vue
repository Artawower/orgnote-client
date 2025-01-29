<template>
  <div class="file-manager">
    <card-wrapper>
      <menu-item>
        <app-description>
          {{ targetPath }}
        </app-description>
      </menu-item>
    </card-wrapper>
    <div class="files">
      <card-wrapper>
        <file-manager-item v-if="targetPath && targetPath !== '/'" @click="moveUp" root />
        <file-manager-item @click="handleFileClick(f)" v-for="f of files" :key="f.name" :file="f" />
      </card-wrapper>
    </div>
    <div class="footer">
      <app-button @click="createDirectory" outline>
        {{ t(I18N.CREATE_DIRECTORY) }}
      </app-button>
      <app-button outline v-if="pickDir">
        {{ t(I18N.PICK_FOLDER) }}
      </app-button>
      <app-button outline v-if="closable" @click="emits('close')">
        {{ t(I18N.CLOSE_PAGE) }}
      </app-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getParentDir, I18N, join, withRoot, type DiskFile } from 'orgnote-api';
import { api } from 'src/boot/api';
import AppButton from 'src/components/AppButton.vue';
import FileManagerItem from './FileManagerItem.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from './MenuItem.vue';
import AppDescription from 'src/components/AppDescription.vue';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
  path?: string;
  pickDir?: boolean;
  closable?: boolean;
}>();

const emits = defineEmits<{
  (e: 'close'): void;
}>();

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});

const targetPath = ref(props.path);

const fs = api.core.useFileSystem();

const files = ref<DiskFile[]>([]);

watch(targetPath, async () => {
  await readDir();
});

const readDir = async () => {
  files.value = await fs.readDir(targetPath.value);
};

readDir();

const createDirectory = async () => {
  const path = join(targetPath.value, 'new directory');
  await fs.mkdir(path);
  await readDir();
};

const handleFileClick = async (f: DiskFile) => {
  if (f.type === 'directory') {
    targetPath.value = withRoot(join(targetPath.value, f.name));
    await readDir();
  }
};

const moveUp = async () => {
  targetPath.value = withRoot(getParentDir(targetPath.value));
  await readDir();
};
</script>

<style lang="scss" scoped>
.file-manager {
  @include flexify(column, flex-start, flex-start, var(--gap-md));
  height: 100%;

  .files {
    flex: 1;
  }

  div {
    width: 100%;
  }
}

.footer {
  @include flexify(row, flex-end, center, var(--gap-md));
}
</style>
