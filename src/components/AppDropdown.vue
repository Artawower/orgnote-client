<template>
  <div class="app-dropdown" v-bind="$attrs">
    <v-select
      ref="selectRef"
      v-model="model"
      :options="options"
      :label="optionLabel"
      :reduce="optionValue ? (opt: T) => getOptionValue(opt) : undefined"
      :placeholder="placeholder"
      :disabled="disable"
      :multiple="multiple"
      :clearable="false"
      :filterable="useInput"
      :searchable="useInput"
      :close-on-select="!multiple"
      :input-id="inputId"
      :append-to-body="appendToBody"
      class="app-select"
    >
      <template v-if="slots.selected" #selected-option="scope">
        <slot name="selected" v-bind="scope" />
      </template>

      <template v-if="slots.option" #option="scope">
        <slot name="option" v-bind="scope" />
      </template>

      <template v-if="slots.noOption" #no-options>
        <slot name="noOption" />
      </template>

      <template v-if="clearable && hasSelection" #open-indicator="{ attributes }">
        <span v-bind="attributes" class="clear-button" @click.stop="clearSelection">
          <app-icon class="select-action" name="sym_o_close" size="sm" />
        </span>
      </template>

      <template v-else #open-indicator="{ attributes }">
        <span v-bind="attributes" class="dropdown-indicator">
          <app-icon class="select-action" name="sym_o_keyboard_arrow_down" size="sm" />
        </span>
      </template>
    </v-select>

    <div v-if="slots.append" class="append-slot">
      <slot name="append" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T = unknown">
import { computed, ref, useSlots } from 'vue';
import { isPresent } from 'orgnote-api/utils';
// @ts-expect-error - vue-select beta doesn't have types yet
import VSelect from 'vue-select';
import AppIcon from 'src/components/AppIcon.vue';
import type { StyleVariant } from 'orgnote-api';
import 'vue-select/dist/vue-select.css';

interface Props {
  options: T[];
  optionLabel?: string;
  optionValue?: string | ((opt: T) => unknown);
  placeholder?: string;
  type?: StyleVariant;
  disable?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  useInput?: boolean;
  inputId?: string;
  appendToBody?: boolean;
}

defineOptions({
  inheritAttrs: false,
});

const props = withDefaults(defineProps<Props>(), {
  type: 'plain',
  clearable: true,
  useInput: true,
  appendToBody: false,
});

const model = defineModel<T | T[] | null>();
const slots = useSlots();
const selectRef = ref<InstanceType<typeof VSelect>>();

const hasSelection = computed(() => {
  const value = model.value;
  if (Array.isArray(value)) return value.length > 0;
  return isPresent(value);
});

const getOptionValue = (opt: T): unknown => {
  if (!props.optionValue) return opt;
  if (typeof props.optionValue === 'function') {
    return props.optionValue(opt);
  }
  return (opt as Record<string, unknown>)[props.optionValue];
};

const focus = () => {
  selectRef.value?.focus();
};

const blur = () => {
  selectRef.value?.blur();
};

const clearSelection = () => {
  model.value = (props.multiple ? [] : null) as T[] | null;
};

defineExpose({
  focus,
  blur,
});
</script>

<style lang="scss">
.app-dropdown {
  width: 100%;
}

.app-select {
  padding: var(--menu-item-padding);
  border-radius: var(--menu-item-radius);
  --vs-border-width: 0;
  background: var(--bg-elevated);
  --vs-dropdown-bg: var(--bg-elevated);
  --vs-search-input-bg: var(--bg-elevated);
  --vs-dropdown-option-padding: var(--menu-item-padding);
  --vs-dropdown-option-color: var(--fg);
  --vs-search-input-color: var(--fg);
  --vs-selected-color: var(--fg);
  --vs-dropdown-box-shadow: none;
  --vs-actions-padding: 0;
  --vs-dropdown-option--active-bg: var(--bg-active);
  --vs-dropdown-option--active-color: var(--fg-active);
}

.vs__search,
.vs__search:focus,
.vs__dropdown-toggle {
  padding: 0;
}

.select-action {
  cursor: pointer;
}
</style>
