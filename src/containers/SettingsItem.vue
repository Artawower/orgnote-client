<template>
  <menu-item
    @click="onItemClick"
    v-if="scheme.type !== 'union'"
    :path="getNestedPath(name)"
    :key="name"
  >
    <div class="capitalize text-bold menu-item-content">
      {{ camelCaseToWords(name) }}
    </div>
    <template #right>
      <toggle-button
        @click.prevent
        v-if="scheme.type === 'boolean'"
        v-model="config[props.path][props.name]"
      />
      <input
        class="text-right"
        v-else-if="scheme.type === 'number'"
        :type="scheme.type"
        v-model="config[props.path][props.name]"
        ref="editInputRef"
        :name="name"
      />
    </template>
  </menu-item>
  <template v-if="scheme.type === 'union'">
    <menu-item
      @click="config[props.path][props.name] = option.literal"
      v-for="option of scheme.options"
      :key="option"
      :selected="config[props.path][props.name] === option.literal"
    >
      <div class="capitalize menu-item-content">
        {{ option.literal }}
      </div>
    </menu-item>
  </template>
</template>

<script lang="ts" setup>
import MenuItem from './MenuItem.vue';
import ToggleButton from 'src/components/ToggleButton.vue';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';
import { api } from 'src/boot/api';
import { ref } from 'vue';

const props = defineProps<{
  path: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scheme: Record<string, any>;
}>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { config } = api.core.useSettings() as Record<string, any>;
const getNestedPath = (path: string) => `${props.path}.${path}`;

const editInputRef = ref<HTMLInputElement | null>(null);

const onItemClick = () => {
  if (editInputRef.value) {
    editInputRef.value.focus();
  }
  if (props.scheme.type === 'boolean') {
    config[props.path][props.name] = !config[props.path][props.name];
  }
};
</script>

<style lang="scss" scoped>
input {
  color: var(--fg);
  border: none;
  background: transparent;

  @include reset-input();
}
</style>
