<template>
  <div class="search-container">
    <header-bar>
      <template v-slot:header>
        <div class="text-capitalize">
          <search-input v-model="search" :autofocus="autofocus" />
        </div>
      </template>
    </header-bar>
    <!-- TODO: check item position. Render on top of buttons when no bottom space  -->
    <div class="items">
      <div
        v-for="item of filteredItems"
        class="search-container-item"
        :key="item.name"
        @click="handleItem(item)"
      >
        <div class="icon">
          <q-icon size="md" :name="item.icon"></q-icon>
        </div>
        <div class="title text-capitalize">{{ $t(item.name) }}</div>
        <div class="description text-capitalize">
          {{ $t(item.description) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
export interface SearchItem {
  name: string;
  description?: string;
  icon?: string;
  handler: (...arg: any[]) => void;
}
</script>

<script lang="ts" setup>
import { computed, ref } from 'vue';

import HeaderBar from './HeaderBar.vue';
import SearchInput from './SearchInput.vue';

const props = defineProps<{
  items: SearchItem[];
  autofocus?: boolean;
  handlerWrapper?: (
    handler: (...arg: any[]) => void
  ) => (...arg: any[]) => void;
}>();

const search = ref<string>('');

const filteredItems = computed(() =>
  props.items.filter(
    (i) =>
      !search.value ||
      i.name.includes(search.value.trim().toLowerCase()) ||
      i.description?.toLowerCase().includes(search.value.trim().toLowerCase())
  )
);

const handleItem = (item: SearchItem) => {
  if (props.handlerWrapper) {
    props.handlerWrapper(item.handler)();
  } else {
    item.handler();
  }
};
</script>

<style lang="scss" scoped>
.search-container {
  @include flexify(column);

  padding: var(--box-padding);
  max-height: 100%;
}

.items {
  width: 100%;
  margin-top: 16px;
  overflow: auto;
  flex: 1;
  padding-right: 8px;
}

.search-container-item {
  display: grid;
  grid-template-columns: var(--search-icn-size) auto;
  cursor: pointer;
  align-items: center;
  padding: 8px;
  column-gap: 16px;

  &:hover {
    background-color: var(--base7);
    border-radius: var(--default-item-radius);
  }

  .icon {
    @include flexify(center, center);
    margin-left: 4px;
    border: 1px solid var(--base7);
    border-radius: var(--default-item-radius);
    width: var(--search-icn-size);
    height: var(--search-icn-size);
    grid-column: 1;
    grid-row-start: 1;
    grid-row-end: 3;
    color: var(--fg);
  }

  .title {
    font-weight: bold;
  }

  .description {
    color: var(--fg-alt);
  }

  .title,
  .description {
    grid-column: 2;
  }
}
</style>
