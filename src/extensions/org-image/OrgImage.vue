<template>
  <div class="org-image-container">
    <app-image
      v-if="showImage"
      :src="resolvedSrc!"
      :alt="imageAlt"
      class="org-image"
      @error="onImageError"
    />
    <app-flex v-if="showLoading" column center class="org-image-loading">
      <loading-dots />
    </app-flex>
    <app-flex v-if="showNotFound" column center class="org-image-not-found">
      <span>{{ $t(hasError ? I18N.IMAGE_LOAD_FAILED : I18N.IMAGE_NOT_FOUND) }}</span>
      <span v-if="imagePath" class="org-image-path">{{ truncatedPath }}</span>
    </app-flex>
  </div>
</template>

<script setup lang="ts">
import type { OrgNode } from 'org-mode-ast';
import { computed, ref, watchEffect } from 'vue';
import { uint8ArrayToBase64, isNullable, to } from 'orgnote-api/utils';
import { I18N } from 'orgnote-api';
import { api } from 'src/boot/api';
import AppFlex from 'src/components/AppFlex.vue';
import AppImage from 'src/components/AppImage.vue';
import LoadingDots from 'src/components/LoadingDots.vue';

const props = defineProps<{
  node: OrgNode;
  nodeGetter?: () => OrgNode;
}>();

const hasError = ref(false);
const isLoading = ref(false);
const resolvedSrc = ref<string | null>(null);

const currentNode = computed(() => props.nodeGetter?.() ?? props.node);

const extractLink = (raw: string): string => {
  const match = raw.match(/\[\[([^\]]+)\]/);
  return match?.[1] ?? raw;
};

const rawLink = computed(() => currentNode.value.children?.get(1)?.children?.get(1)?.value ?? '');

const normalizeImagePath = (path: string): string => {
  if (path.startsWith('file:')) return path.slice(5);
  if (path.startsWith('attachment:')) return path.slice(11);
  return path;
};

const imagePath = computed(() => normalizeImagePath(extractLink(rawLink.value)));

const isExternalUrl = (path: string): boolean =>
  path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:');

const isValidPath = (path: string): boolean => {
  if (!path) return false;
  if (path.includes('..')) return false;
  return true;
};

const truncatedPath = computed(() => {
  const src = imagePath.value;
  const maxLen = 50;
  return src.length > maxLen ? `${src.slice(0, maxLen)}...` : src;
});

const linkNameNode = computed(() =>
  (currentNode.value.children?.length ?? 0) === 4 ? currentNode.value.children?.get(2) : null,
);

const imageAlt = computed(() => linkNameNode.value?.children?.get(1)?.rawValue ?? imagePath.value);

const readImageAsDataUrl = async (path: string): Promise<string | null> => {
  const fs = api.core.useFileSystem();
  const bytes = await fs.readFile(path, 'binary');
  if (!bytes) return null;
  return `data:image/*;base64,${uint8ArrayToBase64(bytes)}`;
};

const resolveImageSrc = async (path: string): Promise<string | null> => {
  if (!path) return null;
  if (isExternalUrl(path)) return path;
  if (!isValidPath(path)) return null;

  const result = await to(readImageAsDataUrl)(path);
  if (result.isErr()) {
    api.utils.logger.error(`Failed to load image: ${path}`, { error: result.error });
    return null;
  }
  return result.value;
};

const showImage = computed(() => resolvedSrc.value && !hasError.value);
const showLoading = computed(() => isLoading.value && !showImage.value);
const showNotFound = computed(() => !showImage.value && !showLoading.value);

const updateImageState = (src: string | null) => {
  resolvedSrc.value = src;
  hasError.value = isNullable(src);
};

const loadImage = async (path: string) => {
  isLoading.value = true;
  const src = await resolveImageSrc(path);
  updateImageState(src);
  isLoading.value = false;
};

watchEffect(() => {
  void loadImage(imagePath.value);
});

const onImageError = () => {
  hasError.value = true;
};
</script>

<style lang="scss" scoped>
.org-image-container {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
}

.org-image {
  border-radius: var(--border-radius-md);
}

.org-image-not-found,
.org-image-loading {
  min-height: 80px;
  padding: var(--gap-md);
  border: var(--border-default);
  color: var(--fg-muted);
  font-size: var(--font-size-md);
  text-align: center;
  border-radius: var(--border-radius-md);
}

.org-image-path {
  font-size: var(--font-size-sm);
  word-break: break-all;
  opacity: 0.7;
}
</style>
