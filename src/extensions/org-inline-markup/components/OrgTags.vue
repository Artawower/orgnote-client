<template>
  <app-flex start class="org-tags" gap="sm">
    <app-badge
      v-for="tag in tags"
      @click="searchTag(tag)"
      :key="tag"
      class="org-tag"
      color="accent"
    >
      {{ tag }}
    </app-badge>
  </app-flex>
</template>

<script lang="ts" setup>
import { NodeType } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';
import { api } from 'src/boot/api';
import AppBadge from 'src/components/AppBadge.vue';
import AppFlex from 'src/components/AppFlex.vue';
import { computed } from 'vue';

const props = defineProps<{
  node: OrgNode;
}>();

const tags = computed<string[]>(
  () => props.node.children?.filter((n) => n.is(NodeType.Text)).map((n) => n.value) ?? [],
);

const searchTag = (tag: string) => {
  api.core.useNotifications().notify({
    message: 'Tag search not implemented yet.',
    description: tag,
  });
};
</script>

<style lang="scss" scoped>
.org-tag {
  cursor: pointer;
}
</style>
