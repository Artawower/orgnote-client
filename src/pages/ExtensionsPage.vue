<template>
  <q-page>
    <div class="search-header">
      <search-input
        v-model="extensionsStore.searchQuery"
        :autofocus="true"
        theme="heavy"
      />
      <action-btn @click="uploadExtension" icon="upload" size="lg">
        {{ $t('upload') }}
      </action-btn>
    </div>

    <div class="extensions">
      <extension-preview
        v-for="ext of extensionsStore.filteredExtensions"
        :extension="ext"
        :key="ext.manifest.name"
      />
    </div>
  </q-page>
</template>

<script lang="ts" setup>
import { useExtensionsStore } from 'src/stores/extensions';
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
</script>

<style lang="scss" scoped>
.header {
  @include flexify();
}
</style>

<style lang="scss" scoped>
.search-header {
  @include flexify(row, center, flex-end);

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
</style>
