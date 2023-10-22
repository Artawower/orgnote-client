<template>
  <component
    :is="container ?? 'div'"
    ref="tagsWrapperRef"
    v-if="tags?.length"
    class="tags-wrapper"
    :class="[ellipsisExists && 'long', { inline: props.inline }]"
  >
    <template v-if="type === 'badges'">
      <q-badge
        v-for="tag in tags"
        class="tag q-px-sm q-py-xs"
        :key="tag"
        @click.stop.prevent="searchByTag(tag)"
        rounded
        :color="$q.dark.isActive ? 'grey-3' : 'grey-9'"
        outline
        :text-color="$q.dark.isActive ? 'grey-3' : 'grey-9'"
        size="2rem"
        :label="tag"
      />
    </template>
    <template v-else>
      <span
        v-for="tag in tags"
        class="text-tag text-italic text-weight-medium"
        :key="tag"
        @click.stop.prevent="searchByTag(tag)"
      >
        {{ withHash ? '#' : '' }}{{ tag }}
      </span>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { useSearchStore } from 'src/stores';

import { computed, onMounted, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    tags?: string[];
    type?: 'text' | 'badges';
    inline?: boolean;
    container?: string;
    withHash?: boolean;
  }>(),
  {
    type: 'text',
    inline: true,
    withHash: true,
  }
);

const tags = computed(() => Array.from(new Set(props.tags)));

const searchStore = useSearchStore();
const searchByTag = (tag: string) => {
  searchStore.initCompletion({ searchText: `#${tag}` });
};
const ellipsisExists = ref(false);
const tagsWrapperRef = ref<HTMLElement | null>(null);

const checkEllipsis = () => {
  if (tagsWrapperRef.value) {
    const { scrollWidth, offsetWidth } = tagsWrapperRef.value;
    ellipsisExists.value = scrollWidth > offsetWidth;
  }
};

onMounted(() => {
  checkEllipsis();
});
</script>

<style lang="scss">
.tags-wrapper {
  @include flexify-inline(row, flex-start);
  flex-wrap: wrap;
  gap: 0 var(--small-gap);

  text-overflow: ellipsis;
  position: relative;
  z-index: 2;
  border: 1px solid transparent;
  box-sizing: border-box;
  width: 100%;

  &.inline {
    white-space: nowrap;
    overflow: hidden;
  }

  &:hover {
    white-space: normal;
    overflow: visible;
    background: var(--bg);

    &.long {
      border: 1px solid var(--fg);
      border-radius: 1rem;
    }
  }
}
.text-tag,
.tag {
  cursor: pointer;
}

.tag {
  &:hover {
    background-color: var(--tag-hover-background) !important;
    color: var(--tag-hover-color) !important;
  }
}

.text-tag {
  &:hover {
    color: var(--teal);
  }
}
</style>
