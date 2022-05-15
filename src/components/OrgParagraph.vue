<template>
  <p v-for="(c, i) in content.children" v-bind:key="i">
    <template v-if="c.type === 'text'">{{ c.value }} </template>
    <!-- TODO: master  Optimize.-->
    <org-link v-if="c.type === 'link'" :content="c"></org-link>
    <span v-else>
      <content-renderer :content="c" :key="i"></content-renderer>
    </span>
  </p>
</template>

<script setup lang="ts">
import { Paragraph } from 'uniorg';
import { toRef, defineComponent } from 'vue';

import ContentRenderer from './ContentRenderer.vue';
import OrgLink from './OrgLink.vue';

const props = defineProps<{
  content: Paragraph;
}>();

defineComponent({
  ContentRenderer,
  OrgLink,
});

const content = toRef(props, 'content');
</script>
