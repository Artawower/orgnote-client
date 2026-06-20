<template>
  <app-flex class="property-value link-value" start gap="sm" @click="$emit('edit')">
    <span>{{ displayed }}</span>
    <action-button
      v-if="canOpenLink"
      icon="sym_o_open_in_new"
      size="sm"
      color="fg-muted"
      @click.stop="openExternalUrl(item.value)"
    />
  </app-flex>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { OrgPropertyEntry } from 'orgnote-api';
import { I18N } from 'orgnote-api';
import ActionButton from 'src/components/ActionButton.vue';
import AppFlex from 'src/components/AppFlex.vue';
import { isOpenableExternalUrl, openExternalUrl } from 'src/utils/open-external-url';
import { truncateValue } from './property-value-utils';

const props = defineProps<{ item: OrgPropertyEntry }>();

defineEmits<{ edit: [] }>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });
const displayed = computed(() => truncateValue(props.item.value || t(I18N.EMPTY_VALUE_PLACEHOLDER)));
const canOpenLink = computed(() => isOpenableExternalUrl(props.item.value));
</script>
