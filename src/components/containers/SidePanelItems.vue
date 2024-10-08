<template>
  <template v-for="item of items" :key="item.command">
    <q-item
      v-if="!item.disabled?.()"
      clickable
      @click="emits('executeAction', item)"
    >
      <q-item-section avatar>
        <q-icon :name="extractDynamicValue(item.icon)"></q-icon>
      </q-item-section>
      <q-item-section>
        {{ getTitle(item) }}
      </q-item-section>
    </q-item>
  </template>
</template>

<script lang="ts" setup>
import { Command } from 'orgnote-api';
import { extractDynamicValue } from 'src/tools';
import { useI18n } from 'vue-i18n';

defineProps<{
  items: Command[];
}>();

const emits = defineEmits<{
  (e: 'executeAction', command: Command): void;
}>();

const { t } = useI18n();

const getTitle = (item: Command) => {
  if (!item.title) {
    return '';
  }
  return t(`${extractDynamicValue<string>(item.title)}`);
};
</script>
