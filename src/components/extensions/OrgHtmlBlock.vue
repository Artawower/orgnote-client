<template>
  <div ref="htmlBlockRef" class="html-block-wrapper" v-html="htmlContent"></div>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';

import { computed, ref } from 'vue';

const props = defineProps<{
  node: OrgNode;
}>();

const htmlContent = computed(() => {
  return props.node.children.get(2).rawValue;
});

const htmlBlockRef = ref<HTMLElement | null>(null);

// TODO: master optional html rendering with encapsulated styles
// onMounted(() => {
//   const shadowRoot = htmlBlockRef.value?.attachShadow({ mode: 'open' });
//   const div = document.createElement('div');
//   div.innerHTML = htmlContent.value;
//   shadowRoot?.appendChild(div);
// });
</script>
