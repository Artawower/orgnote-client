<template>
  <div v-if="tags" class="tags-wrapper">
    <q-badge
      v-for="tag in tags"
      class="tag q-px-sm q-py-xs"
      :key="tag"
      @click="searchByTag(tag)"
      rounded
      :color="$q.dark.isActive ? 'grey-3' : 'grey-9'"
      outline
      :text-color="$q.dark.isActive ? 'grey-3' : 'grey-9'"
      size="2rem"
      :label="tag"
    />
  </div>
</template>

<script lang="ts" setup>
import { useNotesStore } from 'src/stores/notes';
import { toRefs } from 'vue';

const props = defineProps<{
  tags?: string[];
}>();

const { tags } = toRefs(props);

const notesStore = useNotesStore();
const searchByTag = (tag: string) => notesStore.setFilters({ searchText: tag });
</script>

<style lang="scss">
@include light-mode {
  --tag-hover-background: #{$grey-9};
  --tag-hover-color: #{$grey-3};
}
@include dark-mode {
  --tag-hover-background: #{$grey-3};
  --tag-hover-color: #{$grey-9};
}
.tags-wrapper {
  padding: 0 0.5rem;
}
.tag {
  cursor: pointer;
  &:not(:first-child) {
    margin-left: 0.5rem;
  }

  &:hover {
    background-color: var(--tag-hover-background) !important;
    color: var(--tag-hover-color) !important;
  }
}
</style>
