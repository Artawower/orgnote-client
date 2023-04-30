<template>
  <div class="section">
    <component
      :is="'h' + node.level"
      class="headline"
      :class="{ folded }"
      @click="toggleContent"
    >
      <q-icon
        v-if="node.section?.children?.length"
        size="sm"
        :name="folded ? 'arrow_right' : 'arrow_drop_down'"
      ></q-icon>
      <content-renderer :node="node.title"> </content-renderer>
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
    <div v-show="!folded" class="section-content">
      <content-renderer :node="node.section"></content-renderer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';
import { ref, toRef } from 'vue';
import ContentRenderer from './ContentRenderer.vue';

const props = defineProps<{
  node: OrgNode;
}>();

const node = toRef(props, 'node');

const folded = ref(false);

const toggleContent = () => {
  folded.value = !folded.value;
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
  @include flexify(row, flex-start, center);

  cursor: pointer;

  p {
    margin: 0;
  }
}

.section-content {
  margin-left: 20px;
}
</style>
