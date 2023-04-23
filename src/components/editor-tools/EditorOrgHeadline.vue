<template>
  <component :is="'h' + (level + 1)">
    <input
      class="editor-input"
      :class="'level-' + level"
      v-model="content"
      type="text"
    />
  </component>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue';

const props = defineProps<{
  payload: {
    content: string;
    level?: number;
  };
}>();

const content = ref(props.payload.content);
const level = ref(props.payload.level ?? 0);

watch(
  () => props.payload.content,
  (newVal) => {
    content.value = newVal;
  }
);

const getData = () => {
  return content.value;
};

defineExpose({
  getData,
});
</script>

<styles lang="scss">
h1,
h2,
h3,
h4,
h5,
h6 {
  margin: 0;
  padding: 0;
}
</styles>
