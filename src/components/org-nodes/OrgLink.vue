<template>
  <app-link
    :href="href"
    :external="!handledByApp"
    class="org-link"
    @click="handleClick"
  >
    {{ displayText }}
  </app-link>
</template>

<script setup lang="ts">
import type { OrgNode } from 'org-mode-ast';
import AppLink from 'src/components/AppLink.vue';
import { computed, toRef } from 'vue';
import {
  isInternalLink,
  extractInternalId,
  isRelativeFileLink,
  extractOrgLinkTarget,
  normalizeOrgResourcePath,
} from 'src/utils/org-link';
import { useInternalLinkHandler } from 'src/composables/use-internal-link-handler';

const props = defineProps<{
  node: OrgNode;
}>();

defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const node = toRef(props, 'node');

const rawLink = computed(() => node.value.children?.get(1)?.children?.get(1)?.value ?? '');
const linkAddress = computed(() => normalizeOrgResourcePath(extractOrgLinkTarget(rawLink.value)));

const internal = computed(() => isInternalLink(linkAddress.value));
const relativeFile = computed(() => isRelativeFileLink(linkAddress.value));
const handledByApp = computed(() => internal.value || relativeFile.value);

const href = computed(() => {
  if (!handledByApp.value) return linkAddress.value;
  return '#';
});

const linkNameNode = computed(() =>
  (node.value.children?.length ?? 0) === 4 ? node.value.children?.get(2) : null,
);

const displayText = computed(
  () => linkNameNode.value?.children?.get(1).rawValue ?? linkAddress.value,
);

const { handleClick: handleInternalLink, handleFileLink } = useInternalLinkHandler();

const handleClick = async (event: MouseEvent): Promise<void> => {
  if (!handledByApp.value) return;
  event.preventDefault();

  if (internal.value) {
    await handleInternalLink(extractInternalId(linkAddress.value), displayText.value);
    return;
  }

  if (relativeFile.value) {
    await handleFileLink(linkAddress.value);
  }
};
</script>
