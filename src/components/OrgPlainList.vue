<template>
  <component :is="parentListTag">
    <li v-for="(c, i) in content.children" v-bind:key="i">
      <content-renderer
        v-for="(nc, j) in c.children"
        v-bind:key="j"
        :content="nc"
      ></content-renderer>
    </li>
  </component>
</template>

<script setup lang="ts">
import { List } from 'uniorg';
import { defineComponent, toRef } from 'vue';
import ContentRenderer from './ContentRenderer.vue';

defineComponent({
  ContentRenderer,
});

const props = defineProps<{
  content: List;
}>();

const content = toRef(props, 'content');
const parentListTag = props.content.listType === 'ordered' ? 'ol' : 'ul';
</script>
