<template>
  <div>
    <component
      v-for="c of content?.children"
      v-bind:key="c.position"
      :is="typedComponents[c.type]"
      :content="c"
    ></component>
  </div>
</template>

<script setup lang="ts">
import type { OrgData, OrgNode } from 'uniorg';
import { defineComponent, toRefs } from 'vue';
import type { Component } from 'vue';

import ContentRenderer from './ContentRenderer.vue';
import OrgHeadline from './OrgHeadline.vue';
import OrgQuote from './OrgQuote.vue';
import OrgParagraph from './OrgParagraph.vue';
import OrgText from './OrgText.vue';

const typedComponents: { [key in OrgNode['type']]?: Component } = {
  section: ContentRenderer,
  headline: OrgHeadline,
  'quote-block': OrgQuote,
  paragraph: OrgParagraph,
  text: OrgText,
};

defineComponent(typedComponents);

const props = defineProps<{
  content: OrgData;
}>();

const { content } = toRefs(props);
console.log('content: ', content.value);
</script>
