<template>
  <ul v-for="(c, i) in content.children" v-bind:key="i">
    <li>
      <content-renderer
        v-for="(nc, j) in c.children"
        v-bind:key="j"
        :content="nc"
      ></content-renderer>
    </li>
  </ul>
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
</script>
