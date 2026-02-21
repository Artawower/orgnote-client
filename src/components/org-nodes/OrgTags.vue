<template>
  <app-flex inline start class="org-tags" :class="{ wrap }" gap="sm">
    <app-badge
      v-for="tag in tags"
      @click="onTagClick(tag)"
      :key="tag"
      class="org-tag"
      :class="{ clickable }"
      color="accent"
      :size="badgeSize"
    >
      {{ tag }}
    </app-badge>
  </app-flex>
</template>

<script lang="ts" setup>
import { NodeType } from 'org-mode-ast';
import type { OrgNode } from 'org-mode-ast';
import { DefaultCommands, type StyleSize } from 'orgnote-api';
import { api } from 'src/boot/api';
import AppBadge from 'src/components/AppBadge.vue';
import AppFlex from 'src/components/AppFlex.vue';
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    node?: OrgNode;
    tags?: string[];
    clickable?: boolean;
    wrap?: boolean;
    badgeSize?: StyleSize;
  }>(),
  {
    clickable: true,
    wrap: true,
    badgeSize: 'sm',
  },
);

const tags = computed<string[]>(() => {
  if (props.tags?.length) {
    return props.tags;
  }

  return props.node?.children?.filter((n) => n.is(NodeType.Text)).map((n) => n.value) ?? [];
});

const onTagClick = (tag: string) => {
  if (!props.clickable) {
    return;
  }
  const commands = api.core.useCommands();
  commands.execute(DefaultCommands.SEARCH, { searchText: tag });
};
</script>

<style lang="scss" scoped>
.org-tag {
  white-space: nowrap;

  &.clickable {
    cursor: pointer;
  }
}

.org-tags {
  max-width: 100%;
  align-items: flex-start;

  &.wrap {
    flex-wrap: wrap;
  }
}
</style>
