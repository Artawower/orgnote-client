<template>
  <div :key="extension.manifest.name" class="extension">
    <div class="header">
      <div class="icon">
        <img
          v-if="extension.manifest.icon"
          :alt="'extension.manifest.name' + ' icon'"
          :src="extension.manifest.icon"
        />
        <q-icon v-else name="extension" size="3rem"></q-icon>
      </div>
      <div class="info">
        <h4 class="text-h4 title">
          {{ extension.manifest.name }} {{ extension.manifest.version }}
          <div class="actions">
            <action-btn
              icon="delete"
              theme="red"
              @click="extensionsStore.deleteExtension(extension)"
              >{{ $t('delete') }}</action-btn
            >
            <action-btn
              :icon="extension.active ? 'cancel' : 'download_for_offline'"
              :theme="extension.active ? 'red' : 'magenta'"
              @click="toggleExtensionStatus"
              >{{ extension.active ? $t('disable') : $t('enable') }}</action-btn
            >
          </div>
        </h4>
        <div class="source">
          <span class="author">{{ extension.manifest.author }}</span>
          <a
            class="author link"
            :href="extension.manifest.source"
            target="_blank"
            >{{ extension.manifest.source }}</a
          >
        </div>
        <div class="description">{{ extension.manifest.description }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ExtensionMeta } from 'src/api/extension';
import { useExtensionsStore } from 'src/stores';

import ActionBtn from 'src/components/ui/ActionBtn.vue';

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

  .info {
    @include flexify(column, flex-start, flex-start);

    gap: var(--gap-xs);
    width: 100%;
  }

  .title {
    color: var(--magenta);

    @include flexify(row, space-between);
    width: 100%;
  }

  .author {
    color: var(--blue);
  }

  .icon {
    align-self: center;
  }
}

.actions {
  @include flexify();

  gap: var(--gap-md);
}
</style>
