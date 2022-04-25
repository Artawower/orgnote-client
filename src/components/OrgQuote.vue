<template>
  <q>
    <p v-for="(c, i) in content?.children" v-bind:key="i">
      <content-renderer :content="asOrgData(c)"></content-renderer>
    </p>
  </q>
</template>

<script setup lang="ts">
import { defineComponent, toRef } from 'vue';
import { ElementType, GreaterElementType, OrgData, QuoteBlock } from 'uniorg';
import ContentRenderer from './ContentRenderer.vue';

const props = defineProps<{
  content: QuoteBlock;
}>();

defineComponent({
  ContentRenderer,
});

const asOrgData = (c: GreaterElementType | ElementType): OrgData =>
  c as unknown as OrgData;

const content = toRef(props, 'content');
</script>
