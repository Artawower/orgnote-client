<template>
  <q-item
    v-for="item of items"
    clickable
    @click="emits('executeAction', item.handler)"
    :key="item.name"
  >
    <q-item-section avatar>
      <q-icon :name="item.icon"></q-icon>
    </q-item-section>
    <q-item-section>
      {{ $t(item.name) }}
    </q-item-section>
  </q-item>
</template>

<script lang="ts" setup>
import { ToolBarAction } from 'src/stores';

defineProps<{
  items: ToolBarAction[];
}>();

const emits = defineEmits<{
  (e: 'executeAction', handler: ToolBarAction['handler']): void;
}>();
</script>
