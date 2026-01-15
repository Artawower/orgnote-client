<template>
  <div class="settings-scheme">
    <app-description v-if="name" padded>
      {{ name.toUpperCase() }}
    </app-description>
    <app-flex
      v-if="
        scheme.type === 'union' && conditionalKey && Object.keys(conditionalOption ?? {}).length
      "
      class="union-settings"
      column
      start
      align-center
      gap="lg"
    >
      <card-wrapper>
        <menu-item
          v-for="(o, i) of scheme.options"
          :key="i"
          :selected="o.entries?.[conditionalKey!]?.literal === encryptionConfig"
          :active="o.entries?.[conditionalKey!]?.literal === encryptionConfig"
          @click="changeConditionalType(o.entries?.[conditionalKey!]?.literal)"
        >
          {{ camelCaseToWords(o.entries?.[conditionalKey!]?.literal) }}
        </menu-item>
      </card-wrapper>
      <settings-scheme :scheme="conditionalOption!" :path="path" />
    </app-flex>
    <card-wrapper v-else>
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
import { isPresent } from 'orgnote-api/utils';
import AppFlex from 'src/components/AppFlex.vue';
import AppDescription from 'src/components/AppDescription.vue';

const props = defineProps<{
  path: keyof OrgNoteConfig;
  name?: string;
  scheme: ValibotScheme;
}>();

const { config } = storeToRefs(api.core.useConfig());

const metadata = props.scheme.pipe?.find((e) => e.type === 'metadata')?.metadata;
const conditionalKey: string | undefined = metadata?.conditionalKey;

const encryptionConfig = computed(() => {
  if (!isPresent(conditionalKey)) return;
  return config.value[props.path]?.[conditionalKey];
});

const isOption = (v: ValibotScheme): boolean => {
  if (!isPresent(conditionalKey)) return false;
  return v.entries?.[conditionalKey]?.literal === encryptionConfig.value;
};

const rawConditionalOption = computed(() => {
  if (!isPresent(conditionalKey)) return;
  return props.scheme.options?.find(isOption);
});

const conditionalOption = computed(() => {
  const rawOption = rawConditionalOption.value;

  if (!isPresent(rawOption) || !isPresent(conditionalKey)) return;

  const entries = { ...rawOption.entries };
  delete entries[conditionalKey];

  return {
    type: rawOption.type,
    ...(rawOption.options && { options: rawOption.options }),
    ...(rawOption.pipe && { pipe: rawOption.pipe }),
    entries,
    ...(rawOption.literal && { literal: rawOption.literal }),
    ...(rawOption.wrapped && { wrapped: rawOption.wrapped }),
  };
});

const changeConditionalType = (t?: string): void => {
  if (!isPresent(conditionalKey)) return;
  config.value[props.path][conditionalKey] = t;
};
</script>

<style lang="scss" scoped>
.settings-scheme {
  width: 100%;
}
</style>
