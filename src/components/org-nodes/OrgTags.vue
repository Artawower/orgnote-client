<template>
  <app-flex inline start class="org-tags" gap="sm">
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
import { DefaultCommands } from 'orgnote-api';
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
  const commands = api.core.useCommands();
  commands.execute(DefaultCommands.SEARCH, { searchText: tag });
};
</script>

<style lang="scss" scoped>
.org-tag {
  cursor: pointer;
  white-space: nowrap;
}

.org-tags {
  max-width: 100%;
  flex-wrap: wrap;
  align-items: flex-start;
}
</style>
