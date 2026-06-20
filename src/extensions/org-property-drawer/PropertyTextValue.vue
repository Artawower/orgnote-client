<template>
  <span class="property-value" @click="$emit('edit')">
    {{ displayed }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { OrgPropertyEntry } from 'orgnote-api';
import { I18N } from 'orgnote-api';
import { truncateValue } from './property-value-utils';

const props = defineProps<{ item: OrgPropertyEntry }>();

defineEmits<{ edit: [] }>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const displayed = computed(() => truncateValue(props.item.value || t(I18N.EMPTY_VALUE_PLACEHOLDER)));
</script>
