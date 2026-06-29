<template>
  <span v-if="readonly" class="property-value">
    {{ displayed }}
  </span>
  <app-text-area
    v-else
    :model-value="item.value"
    class="property-value editing"
    :placeholder="t(I18N.EMPTY_VALUE_PLACEHOLDER)"
    :rows="1"
    @keydown.enter.stop.prevent="commitAndExit"
    @blur="commit"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { OrgPropertyEntry } from 'orgnote-api';
import { I18N } from 'orgnote-api';
import AppTextArea from 'src/components/AppTextArea.vue';
import { truncateValue } from './property-value-utils';

const props = defineProps<{
  item: OrgPropertyEntry;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  set: [value: string];
  enter: [];
}>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const displayed = computed(() => truncateValue(props.item.value || t(I18N.EMPTY_VALUE_PLACEHOLDER)));

const commit = (event: Event): void => {
  if (!(event.target instanceof HTMLTextAreaElement)) return;
  emit('set', event.target.value);
};

const commitAndExit = (event: Event): void => {
  commit(event);
  emit('enter');
};
</script>
