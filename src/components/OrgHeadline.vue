<template>
  <div class="section">
    <component
      :is="'h' + (+node.level + 1)"
      class="headline"
      @click="toggleContent"
    >
      <content-renderer :node="node.title"></content-renderer>
      <div v-if="node.meta?.tags?.length" class="tag-footer">
        <q-badge
          v-for="tag in node.meta.tags"
          :key="tag"
          rounded
          outline
          color="primary"
          :label="tag"
        />
      </div>
    </component>
    <content-renderer :node="node.section"></content-renderer>
  </div>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';
import { useViewStore } from 'src/stores/view';
import { toRef } from 'vue';
import ContentRenderer from './ContentRenderer.vue';

const props = defineProps<{
  node: OrgNode;
}>();

const viewStore = useViewStore();

const node = toRef(props, 'node');

const toggleContent = () => {
  console.log('toggle here');
};
</script>

<style lang="scss">
.tag-footer {
  margin: 0;
  padding: 0;
  position: relative;
  top: -10px;

  .q-badge {
    cursor: pointer;
  }
}
.headline {
  cursor: pointer;
}
</style>
