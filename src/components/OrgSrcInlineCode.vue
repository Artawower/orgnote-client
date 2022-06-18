<template>
  <code class="inline-code" :class="darkMode ? 'dark' : 'light'">{{
    content.value
  }}</code>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import { Verbatim } from 'uniorg';
import { toRef } from 'vue';

const props = defineProps<{
  content: Verbatim;
}>();

const $q = useQuasar();

const darkMode = toRef($q.dark, 'isActive');

const content = toRef(props, 'content');
console.log(content.value);
</script>

<style lang="scss">
.inline-code {
  padding: 0.2em 0.4em;
  margin: 0;
  font-size: 85%;
  border-radius: 6px;

  &.dark {
    background-color: rgba(99, 110, 123, 0.4);
    color: rgb(173, 186, 199);
  }

  &.light {
    background-color: rgba(175, 184, 193, 0.2);
    color: rgb(36, 41, 47);
  }
}
</style>
