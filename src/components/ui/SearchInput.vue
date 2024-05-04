<template>
  <div class="search-wrapper">
    <q-icon
      name="search"
      :size="theme === 'tiny' ? '1rem' : '1.6rem'"
      class="magnifier"
    />
    <input
      ref="inputRef"
      class="search-input"
      :class="theme"
      name="search"
      type="text"
      autocomplete="off"
      :autofocus="autofocus"
      :value="props.modelValue"
      @input="
        ($event) =>
          emits('update:modelValue', ($event.target as HTMLInputElement).value)
      "
      :placeholder="$t(placeholder)"
    />
    <q-icon
      @click="resetSearch"
      name="cancel"
      role="button"
      :size="theme === 'tiny' ? '1rem' : '1.6rem'"
      class="reset-search active-danger"
    />
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    autofocus?: boolean;
    placeholder?: string;
    theme?: 'heavy' | 'tiny';
  }>(),
  {
    placeholder: 'search',
    theme: 'tiny',
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

const resetSearch = () => {
  emits('update:modelValue', '');
  tryAutofocus();
};
</script>

<style lang="scss">
.search-wrapper {
  position: relative;
  width: 100%;

  --top-icons-alignment: 52%;
}

.search-input {
  width: 100%;
  &:focus {
    outline: none;
  }

  background-color: transparent;
  border: none;
  color: var(--fg);
  height: var(--input-height);
  padding-left: 1.5rem;

  &.heavy {
    padding-left: 2rem;
    border-bottom: 2px solid var(--fg-alt);
    max-width: 100%;
    height: var(--input-lg-height);
    font-size: var(--font-size-lg);
    font-weight: bold;
  }
}

.magnifier {
  position: absolute;
  left: 0;
  top: var(--top-icons-alignment);
  transform: translateY(-50%);
  color: var(--fg-alt);
}

.reset-search {
  position: absolute;
  right: 0;
  top: var(--top-icons-alignment);
  transform: translateY(-50%);
}
</style>
