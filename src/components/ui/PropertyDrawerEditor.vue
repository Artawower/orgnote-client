<template>
  <q-form @submit="updateProperties" class="q-pa-md full-height">
    <div v-for="(_, key) in collectedFields" :key="key" class="flex row gap-16">
      <q-input
        :disable="(key as string).toLowerCase() === 'id'"
        :model-value="key"
        @update:model-value="changeKey(key as string, $event as string)"
        @blur="applyKeyChanging"
        label="key"
      >
        <template v-slot:prepend>
          <q-icon
            class="pointer color-danger"
            size="sm"
            @click="remove(key as string)"
            name="cancel"
          />
        </template>
      </q-input>
      <q-input
        :disable="(key as string).toLowerCase() === 'id'"
        v-model="collectedFields[key]"
        class="flex-1"
        label="value"
      />
    </div>
    <div class="add-action">
      <q-btn
        @click="addNewProperty"
        class="q-pa-sm"
        type="button"
        icon="add"
        color="primary"
        rounded
      />
      <!-- <q-separator class="add-separator" /> -->
    </div>
    <div class="actions">
      <q-btn
        @click="emits('cancel')"
        type="button"
        :label="$t('cancel')"
        color="red"
        flat
      />
      <q-btn type="submit" :label="$t('save')" color="primary" flat />
    </div>
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

const addNewProperty = () => {
  collectedFields[''] = '';
};

const remove = (key: string) => {
  delete collectedFields[key];
};
</script>

<style lang="scss" scoped>
.actions {
  @include flexify(row, flex-end, center);
}
.add-action {
  @include flexify(row, center, center);

  position: relative;
  width: 100%;

  padding: 32px;

  button {
    z-index: 2;
  }
}
.add-separator {
  width: 100%;
  z-index: 1;
  position: absolute;
}
</style>
