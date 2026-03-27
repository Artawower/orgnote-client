<template>
  <app-flex column gap="md" class="graph-info-modal">
    <div class="stats">
      <app-badge :label="`${nodesCount} ${t(i18n.GRAPH_NODES_LABEL)}`" variant="accent" rounded />
      <app-badge :label="`${edgesCount} ${t(i18n.GRAPH_EDGES_LABEL)}`" variant="plain" rounded />
    </div>

    <card-wrapper>
      <menu-item icon="sym_o_refresh" flat @click="props.refresh">
        {{ t(i18n.GRAPH_REFRESH) }}
      </menu-item>
    </card-wrapper>

    <card-wrapper>
      <menu-item v-for="field in configFields" :key="field.key" flat prefer="right">
        <span class="field-label">{{ camelCaseToWords(field.key) }}</span>
        <template #right>
          <input-field
            v-model.number="localConfig[field.key]"
            type="number"
            :name="field.key"
            size="sm"
            class="field-input"
          />
        </template>
      </menu-item>
    </card-wrapper>
  </app-flex>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { I18N as i18n } from 'orgnote-api';
import type { GraphUiConfig } from 'orgnote-api';
import AppBadge from 'src/components/AppBadge.vue';
import AppFlex from 'src/components/AppFlex.vue';
import CardWrapper from 'src/components/CardWrapper.vue';
import InputField from 'src/components/InputField.vue';
import MenuItem from 'src/containers/MenuItem.vue';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';

const props = defineProps<{
  nodesCount: number;
  edgesCount: number;
  config: GraphUiConfig;
  refresh: () => void;
  configChange: (config: GraphUiConfig) => void;
}>();

const { t } = useI18n({ useScope: 'global', inheritLocale: true });

const localConfig = reactive<GraphUiConfig>({ ...props.config });

const configFields: Array<{ key: keyof GraphUiConfig }> = [
  { key: 'nodeRelSize' },
  { key: 'linkDistance' },
  { key: 'chargeStrength' },
  { key: 'warmupTicks' },
  { key: 'velocityDecay' },
  { key: 'initialZoom' },
  { key: 'labelFontSize' },
  { key: 'linkWidth' },
];

watch(localConfig, (val) => {
  props.configChange({ ...val });
});
</script>

<style lang="scss" scoped>
.graph-info-modal {
  padding: var(--padding-md);
  min-width: var(--graph-modal-min-width);
}

.field-input {
  width: var(--graph-config-input-width);
}
</style>
