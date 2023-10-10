<template>
  <input
    ref="inputRef"
    class="search-input"
    name="search"
    type="text"
    autocomplete="off"
    :autofocus="autofocus"
    :value="props.modelValue"
    @input="($event) => emits('update:modelValue', ($event.target as HTMLInputElement).value)"
    :placeholder="$t(placeholder)"
  />
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    autofocus?: boolean;
    placeholder?: string;
  }>(),
  {
    placeholder: 'search',
  }
);

const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const tryAutofocus = () => {
  if (props.autofocus) {
    inputRef.value.focus();
  }
};

onMounted(() => tryAutofocus());
</script>

<style lang="scss">
.search-input {
  width: 100%;
  &:focus {
    outline: none;
  }

  background-color: transparent;
  border: none;
  color: var(--fg);
}
</style>
