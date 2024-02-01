<template>
  <div :key="extension.manifest.name" class="extension">
    <div class="header">
      <div class="info">
        <h4 class="text-h4 title">
          <img
            v-if="extension.manifest.icon"
            :alt="'extension.manifest.name' + ' icon'"
            :src="extension.manifest.icon"
          />
          <q-icon v-else name="extension" size="2.5rem"></q-icon>
          {{ extension.manifest.name }} {{ extension.manifest.version }}
        </h4>
        <div
          v-if="extension.manifest.author || extension.manifest.sourceUrl"
          class="source"
        >
          <span class="author">{{ extension.manifest.author }}</span>
          <a
            class="author link"
            :href="extension.manifest.sourceUrl"
            target="_blank"
            >{{ extension.manifest.sourceUrl }}</a
          >
        </div>
        <div class="description">{{ extension.manifest.description }}</div>
        <div class="actions">
          <action-btn
            v-if="!extension.uploaded"
            icon="delete"
            theme="magenta"
            :loading="packageManager.loading"
            :disabled="packageManager.loading"
            @click="packageManager.addSource(extension.manifest.sourceUrl)"
            >{{ $t('download') }}</action-btn
          >
          <action-btn
            v-if="extension.uploaded"
            icon="delete"
            theme="red"
            @click="extensionsStore.deleteExtension(extension)"
            >{{ $t('delete') }}</action-btn
          >
          <action-btn
            v-if="extension.uploaded"
            :icon="extension.active ? 'cancel' : 'download_for_offline'"
            :theme="extension.active ? 'red' : 'magenta'"
            @click="toggleExtensionStatus"
            >{{ extension.active ? $t('disable') : $t('enable') }}</action-btn
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ExtensionMeta } from 'src/api/extension';
import { useExtensionsStore } from 'src/stores';

import ActionBtn from 'src/components/ui/ActionBtn.vue';
import { usePackageManagerStore } from 'src/stores/package-manager.store';

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
  gap: var(--gap-md);

  .info {
    @include flexify(column, flex-start, flex-start);

    gap: var(--gap-md);
    width: 100%;
  }

  .title {
    color: var(--magenta);

    @include flexify(row, flex-start, center);
    gap: var(--gap-md);
    width: 100%;

    .q-icon {
      color: var(--magenta);
    }
  }

  .author {
    color: var(--blue);
  }

  .icon {
    align-self: center;

    @include mobile {
      padding-left: var(--block-padding-md);
      padding-right: var(--block-padding-md);
    }
  }
}

.actions {
  @include flexify();

  gap: var(--gap-md);
}
</style>
