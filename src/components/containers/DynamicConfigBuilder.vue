<template>
  <div :class="class" v-for="(v, k) of configChunk" :key="k">
    <template v-if="typeof v === 'object'">
      <h5 class="group-name capitalize">{{ $t(k) }}</h5>
      <dynamic-config-builder :path="[...path, k]" />
    </template>
    <template v-else-if="typeof v === 'boolean'">
      <q-toggle v-model="configChunk[k]" :label="$t(k)"></q-toggle>
    </template>
    <template v-else-if="typeof v === 'string'">
      <q-input
        v-model="(configChunk as Record<string, string>)[k]"
        :label="$t(k)"
      ></q-input>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { useSettingsStore } from 'src/stores/settings';

import { ref, watch } from 'vue';

import DynamicConfigBuilder from './DynamicConfigBuilder.vue';

const props = withDefaults(
  defineProps<{
    path?: string[];
    class?: string;
  }>(),
  {
    path: () => [],
  }
);

const { config } = useSettingsStore();

type ConfigChunk = Record<string, unknown> | number | string | boolean;
const configChunk = ref<ConfigChunk>();

const initConfigChunk = () => {
  let localConfig: ConfigChunk = config;
  props.path.forEach((path) => {
    localConfig = (localConfig as Record<string, unknown>)[path] as ConfigChunk;
  });
  configChunk.value = localConfig as ConfigChunk;
};

watch(() => props.path, initConfigChunk);
initConfigChunk();
</script>
