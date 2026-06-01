<template>
  <div class="input-group">
    <app-flex row align-center gap="sm" class="inner">
      <div v-if="$slots.prefix" class="prefix">
        <slot name="prefix" />
      </div>

      <app-input
        ref="inputRef"
        class="input-field"
        v-bind="$attrs"
        v-model="model"
        :placeholder="placeholder"
        :name="name"
        :disable="disabled"
      />

      <div v-if="$slots.suffix" class="suffix">
        <slot name="suffix" />
      </div>
    </app-flex>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue';
import AppInput from './AppInput.vue';
import AppFlex from './AppFlex.vue';

defineOptions({ inheritAttrs: false });

defineProps<{
  placeholder?: string;
  disabled?: boolean;
  name?: string;
}>();

const model = defineModel<string>();

const inputRef = ref<InstanceType<typeof AppInput>>();

defineExpose({
  focus: () => inputRef.value?.focus(),
});
</script>

<style lang="scss" scoped>
.input-group {
  border: var(--card-border);
  border-radius: var(--card-radius);
  background: var(--bg-elevated);
  transition: border-color 0.15s ease;
  width: 100%;
  box-sizing: border-box;

  &:focus-within {
    border-color: var(--accent);
  }
}

.inner {
  padding: var(--padding-sm) var(--padding-md);
  min-height: var(--control-height);
}

.prefix,
.suffix {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.input-field {
  flex: 1;
  min-width: 0;
}
</style>
