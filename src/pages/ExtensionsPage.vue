<template>
  <q-page>
    <div class="search-header">
      <search-input
        v-model="extensionsStore.searchQuery"
        :autofocus="true"
        theme="heavy"
      />
    </div>

    <div class="actions">
      <action-btn
        @click="addSource"
        icon="fab fa-git-alt"
        size="lg"
        :loading="packageManager.loading"
      >
        {{ $t('add from git') }}
      </action-btn>
      <action-btn
        @click="uploadExtension"
        icon="upload"
        size="lg"
        :loading="packageManager.loading"
      >
        {{ $t('upload') }}
      </action-btn>
    </div>

    <div class="extensions">
      <extension-preview
        v-for="ext of extensionsStore.filteredExtensions"
        :extension="ext"
        :key="ext.manifest.name + ext.uploaded"
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useCompletionStore } from 'src/stores';
import { useExtensionsStore } from 'src/stores/extensions';
import { usePackageManagerStore } from 'src/stores/package-manager.store';
import { uploadFiles } from 'src/tools';
import { readExtension } from 'src/tools/read-extension';

import ExtensionPreview from 'src/components/containers/ExtensionPreview.vue';
import ActionBtn from 'src/components/ui/ActionBtn.vue';
import SearchInput from 'src/components/ui/SearchInput.vue';

const extensionsStore = useExtensionsStore();

const uploadExtension = async () => {
  const uploadedExtensions = await uploadFiles({
    accept: '.js',
    multiple: false,
  });

  const file = uploadedExtensions[0];
  const ext = await readExtension(file);

  extensionsStore.uploadExtension(ext);
};

const completionStore = useCompletionStore();
const packageManager = usePackageManagerStore();

const addSource = async () => {
  const url = await completionStore.readCompletion('git URL');
  packageManager.addSource(url);
};
</script>

<style lang="scss" scoped>
.header {
  @include flexify();
}
</style>

<style lang="scss" scoped>
.search-header {
  gap: var(--gap-md);

  @include mobile {
    flex-direction: column;
    align-items: flex-start;
  }
}

.extensions {
  padding-top: var(--block-padding-md);
}

.q-page {
  max-width: var(--content-max-width);
  margin: auto;
}

.actions {
  @include flexify(row, flex-end, center);

  margin-top: var(--block-margin-md);
  gap: var(--gap-md);
}
</style>
