<template>
  <component
    :is="'h' + (+content.level + 1)"
    class="headline"
    @click="toggleContent"
  >
    <template v-for="c of content.children" :key="c">
      <content-renderer :content="c"></content-renderer>
    </template>
    <template v-if="!visible">...</template>
    <div v-if="content.tags?.length" class="tag-footer">
      <q-badge
        v-for="tag in content.tags"
        :key="tag"
        rounded
        outline
        color="primary"
        :label="tag"
      />
    </div>
  </component>
</template>

<script setup lang="ts">
import { useViewStore } from 'src/stores/view';
import { Headline } from 'uniorg';
import { computed, toRef } from 'vue';
import ContentRenderer from './ContentRenderer.vue';

const props = defineProps<{
  content: Headline;
}>();

const viewStore = useViewStore();

const content = toRef(props, 'content');

const visible = computed(() => viewStore.isHeadlineVisible(content.value));

const toggleContent = () => {
  viewStore.setHeadlineFoldingStatus(content.value, !visible.value);
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
