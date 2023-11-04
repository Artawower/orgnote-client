<template>
  <q-form @submit="updateProperties" class="q-gutter-md q-pa-md">
    <div
      v-for="(_, key) in collectedFields"
      :key="key"
      class="flex row q-gutter-md"
    >
      <q-input
        :disable="(key as string).toLowerCase() === 'id'"
        :model-value="key"
        @update:model-value="changeKey(key as string, $event as string)"
        @blur="applyKeyChanging"
        label="key"
      />
      <q-input
        :disable="(key as string).toLowerCase() === 'id'"
        v-model="collectedFields[key]"
        class="flex-1"
        label="value"
      />
    </div>
    <q-btn type="submit" :label="$t('save')" color="primary" flat />
    <q-btn
      @click="emits('cancel')"
      type="button"
      :label="$t('cancel')"
      color="red"
      flat
    />
  </q-form>
</template>

<script lang="ts" setup>
import { computed, reactive, ref } from 'vue';

const props = defineProps<{
  properties: string;
}>();

const emits = defineEmits<{
  (event: 'change', value: string): void;
  (event: 'cancel'): void;
}>();

const propertiesByLines = props.properties.split('\n');
const firstLine = propertiesByLines[0];
const lastLine = propertiesByLines[propertiesByLines.length - 1];

const collectedFields = reactive<{ [key: string]: string }>(
  propertiesByLines
    .slice(1, -1)
    .reduce<{ [key: string]: string }>((acc, line) => {
      const keyValueRegexp = /:([\w\d-]+): ?(.*)/;
      const match = line.match(keyValueRegexp);
      if (match) {
        const [, key, value] = match;
        acc[key] = value;
      }
      return acc;
    }, {})
);

const rawValue = computed(() => {
  const newProperties = Object.entries(collectedFields)
    .map(([key, value]) => `:${key}: ${value}`)
    .join('\n');

  return `${firstLine}\n${newProperties}\n${lastLine}`;
});

const tmpChangedKeys = ref<[string, string]>();

const changeKey = (oldKey: string, newKey: string) => {
  tmpChangedKeys.value = [oldKey, newKey];
};

const applyKeyChanging = () => {
  if (!tmpChangedKeys.value) {
    return;
  }
  const [oldKey, newKey] = tmpChangedKeys.value;
  collectedFields[newKey] = collectedFields[oldKey];
  delete collectedFields[oldKey];
};

const updateProperties = () => {
  emits('change', rawValue.value);
};
</script>
