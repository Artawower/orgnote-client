<template>
  <p class="org-paragraph">
    <template v-for="(c, i) in content.children" v-bind:key="i">
      <!-- TODO: master  -->
      <!-- <template v-if="c.type === 'text'">{{ c.value }} </template> -->
      <!-- TODO: master  Optimize.-->
      <org-link v-if="c.type === 'link'" :content="c"></org-link>
      <org-src-inline-code
        v-else-if="c.type === 'verbatim'"
        :content="c"
      ></org-src-inline-code>
      <span v-else>
        <content-renderer :content="c" :key="i"></content-renderer>
      </span>
    </template>
  </p>
</template>

<script setup lang="ts">
import { Paragraph } from 'uniorg';
import { toRef, defineComponent } from 'vue';

import ContentRenderer from './ContentRenderer.vue';
import OrgLink from './OrgLink.vue';
import OrgSrcInlineCode from './OrgSrcInlineCode.vue';

const props = defineProps<{
  content: Paragraph;
}>();

defineComponent({
  ContentRenderer,
  OrgLink,
  OrgSrcInlineCode,
});

const content = toRef(props, 'content');
</script>

<style lang="scss" scoped>
.org-paragraph {
  white-space: pre-wrap;
}
</style>
