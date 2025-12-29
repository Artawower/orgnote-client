<template>
  <component
    v-if="showReader"
    :is="readerComponent"
    :buffer="buffer"
    :readonly="buffer!.guard?.readonly"
    @update:content="onContentUpdate"
  />
  <file-not-supported v-if="showNotSupported" :path="currentFilePath" />
  <loading-dots v-if="showLoading" />
</template>

<script lang="ts" setup>
import { computed, defineAsyncComponent, inject, type ShallowRef, type Component } from 'vue';
import type { Router } from 'vue-router';
import type { Buffer as OrgBuffer } from 'orgnote-api';
import { api } from 'src/boot/api';
import { TAB_ROUTER_KEY } from 'src/constants/context-providers';
import LoadingDots from 'src/components/LoadingDots.vue';
import FileNotSupported from 'src/components/FileNotSupported.vue';

const router = inject<ShallowRef<Router>>(TAB_ROUTER_KEY);

const currentFilePath = computed(() => {
  return router?.value?.currentRoute.value.params.path as string | undefined;
});

const buffers = api.core.useBuffers();
const fileReader = api.core.useFileReader();

const buffer = computed<OrgBuffer | undefined>(() => {
  const path = currentFilePath.value;
  if (!path) return;
  return buffers.getBufferByPath(path);
});

const readerEntry = computed(() => {
  const path = currentFilePath.value;
  if (!path) return undefined;
  return fileReader.getReader(path);
});

const readerComponent = computed<Component | undefined>(() => {
  const entry = readerEntry.value;
  if (!entry) return undefined;

  if (typeof entry.component === 'function') {
    const loader = entry.component as () => Promise<Component>;
    return defineAsyncComponent(loader);
  }
  return entry.component as Component;
});

const showReader = computed(() => readerComponent.value && buffer.value);
const showNotSupported = computed(() => buffer.value && !readerComponent.value);
const showLoading = computed(() => !showReader.value && !showNotSupported.value);

const onContentUpdate = (content: string) => {
  if (buffer.value) {
    buffer.value.setText(content);
  }
};
</script>
