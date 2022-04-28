<template>
  <component :is="'h' + content.level">
    {{ content.rawValue }}
    <div class="tag-footer">
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
import { Headline } from 'uniorg';
import { toRef } from 'vue';

const props = defineProps<{
  content: Headline;
}>();

const content = toRef(props, 'content');
</script>

<style lang="scss">
.tag-footer {
  margin: 0;
  padding: 0;
  position: relative;
  top: -26px;

  .q-badge {
    cursor: pointer;
  }
}
</style>
