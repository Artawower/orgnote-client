<template>
  <div :key="extension.manifest.name" class="extension">
    <div class="header">
      <div class="icon">
        <img
          v-if="extension.manifest.icon"
          :alt="'extension.manifest.name' + ' icon'"
          :src="extension.manifest.icon"
        />
        <q-icon v-else name="extension" size="2.5rem"></q-icon>
      </div>
      <div class="title">
        <h4 class="text-h4">
          {{ extension.manifest.name }} {{ extension.manifest.version }}
        </h4>
        <div class="source-info">
          <span v-if="extension.manifest.author" class="author"
            >{{ extension.manifest.author }}&nbsp;
          </span>
          <span
            v-if="extension.manifest.sourceType === 'builtin'"
            class="builtin"
            ><q-icon name="verified" class="builtin" /> {{ $t('built-in') }}
          </span>
          <a
            v-if="extension.manifest.sourceUrl"
            class="author link"
            :href="extension.manifest.sourceUrl"
            target="_blank"
            >{{ extractDomain(extension.manifest.sourceUrl) }}</a
          >
        </div>
      </div>
    </div>
    <div class="body">
      <div class="description">
        {{ extension.manifest.description }}
      </div>
      <div class="actions">
        <action-btn
          v-if="
            !extension.uploaded && extension.manifest.sourceType !== 'builtin'
          "
          icon="delete"
          theme="magenta"
          :loading="packageManager.loading"
          :disabled="packageManager.loading"
          @click="packageManager.addSource(extension.manifest.sourceUrl)"
          >{{ $t('download') }}</action-btn
        >
        <action-btn
          v-if="
            extension.uploaded && extension.manifest.sourceType !== 'builtin'
          "
          icon="delete"
          theme="red"
          @click="extensionsStore.deleteExtension(extension)"
          >{{ $t('delete') }}</action-btn
        >
        <action-btn
          v-if="
            extension.uploaded || extension.manifest.sourceType === 'builtin'
          "
          :icon="extension.active ? 'cancel' : 'download_for_offline'"
          :theme="extension.active ? 'red' : 'magenta'"
          @click="toggleExtensionStatus"
          >{{ extension.active ? $t('disable') : $t('enable') }}</action-btn
        >
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ExtensionMeta } from 'src/api';

import ActionBtn from 'src/components/ui/ActionBtn.vue';
import { useExtensionsStore } from 'src/stores/extensions';
import { usePackageManagerStore } from 'src/stores/package-manager.store';
import { extractDomain } from 'src/tools';

const props = defineProps<{
  extension: ExtensionMeta;
}>();

const extensionsStore = useExtensionsStore();

const toggleExtensionStatus = async () => {
  if (props.extension.active) {
    return await extensionsStore.disableExtension(
      props.extension.manifest.name
    );
  }
  await extensionsStore.enableExtension(props.extension.manifest.name);
};

const packageManager = usePackageManagerStore();
</script>

<style lang="scss" scoped>
.extension {
  cursor: pointer;
  background-color: var(--base7);
  padding: var(--block-padding-md);
  color: var(--fg);
  border-radius: var(--block-border-radius-sm);
  margin-top: var(--block-margin-md);

  &:hover {
    background-color: color-mix(in srgb, var(--blue) 15%, var(--base7));
  }
}
.header {
  @include flexify(row, flex-start, flex-start);
  gap: var(--gap-md);
  width: 100%;
  margin-bottom: var(--block-margin-md);

  .icon {
    .q-icon {
      color: var(--magenta);
    }
    @include mobile {
      padding-left: var(--block-padding-md);
      padding-right: var(--block-padding-md);
    }
  }

  .title {
    @include flexify(column, flex-start, flex-start);
    width: 100%;
  }

  .author {
    color: var(--blue);
  }

  .builtin {
    color: var(--green);
  }
}

.body {
  @include flexify(column, flex-start, flex-start, var(--gap-md));
}

.actions {
  @include flexify();

  gap: var(--gap-md);
}
</style>
