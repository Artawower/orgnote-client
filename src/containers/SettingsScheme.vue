<template>
  <div class="settings-scheme">
    <h5 v-if="name" class="capitalize description">{{ name.toUpperCase() }}</h5>
    <div
      v-if="scheme.type === 'union' && Object.keys(conditionalOption ?? {}).length"
      class="union-settings"
    >
      <card-wrapper background="bg-alt2">
        <menu-item
          @click="changeConditionalType(o.entries[conditionalKey].literal)"
          :selected="o.entries[conditionalKey].literal === encryptionConfig"
          v-for="(o, i) of scheme.options"
          :key="i"
        >
          {{ camelCaseToWords(o.entries[conditionalKey].literal) }}
        </menu-item>
      </card-wrapper>
      <settings-scheme :scheme="conditionalOption" :path="path" />
    </div>
    <card-wrapper v-else background="bg-alt2">
      <settings-item
        v-for="(scheme, name) of props.scheme.entries as Record<string, any>"
        :key="name"
        :name="name"
        :path="path"
        :scheme="scheme"
      ></settings-item>
    </card-wrapper>
  </div>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import SettingsItem from './SettingsItem.vue';
import MenuItem from './MenuItem.vue';
import type { ValibotScheme } from 'src/models/valibot-scheme';
import { computed } from 'vue';
import { api } from 'src/boot/api';
import { type OrgNoteConfig } from 'orgnote-api';
import { storeToRefs } from 'pinia';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';

const props = defineProps<{
  path: keyof OrgNoteConfig;
  name?: string;
  scheme: ValibotScheme;
}>();

const { config } = storeToRefs(api.core.useSettings());

const metadata = props.scheme.pipe?.find((e) => e.type === 'metadata')?.metadata;
const conditionalKey = metadata?.conditionalKey;

const encryptionConfig = computed(() => config.value[props.path]?.[conditionalKey]);

const isOption = (v: ValibotScheme) =>
  v.entries[conditionalKey]?.literal === encryptionConfig.value;

const rawConditionalOption = computed(() => conditionalKey && props.scheme.options?.find(isOption));
const conditionalOption = computed(() => {
  const option = { ...rawConditionalOption.value };
  const entries = { ...option.entries };
  delete entries[conditionalKey];
  option.entries = entries;
  return option;
});

const changeConditionalType = (t: string) => {
  config.value[props.path][conditionalKey] = t;
};
</script>

<style lang="scss" scoped>
.settings-scheme {
  width: 100%;
}

.menu-item-content {
  @include flexify(row, space-between, center);

  width: 100%;
}

.union-settings {
  @include flexify(column, flex-start, center, var(--gap-lg));
}
</style>
