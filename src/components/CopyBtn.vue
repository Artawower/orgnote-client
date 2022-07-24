<template>
  <q-icon
    @click="copy"
    :name="copied ? 'done' : 'content_copy'"
    size="1rem"
    class="copy-btn"
    :class="{ copied, dark: $q.dark.isActive }"
  />
</template>

<script lang="ts" setup>
import { ref, Ref } from 'vue';

const emits = defineEmits<{
  (e: 'copied'): void;
}>();

let copied: Ref<boolean> = ref(false);

const showCopied = () => {
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 1000);
};

const copy = () => {
  showCopied();
  emits('copied');
};
</script>

<style lang="scss">
.copy-btn {
  width: 20px;
  height: 20px;
  cursor: pointer;
  color: $night;
  box-shadow: 0 1px 0 rgba(27, 31, 36, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  border: 1px solid;
  border-color: $smog;
  border-radius: 6px;
  padding: 6px;

  &.dark {
    color: $light;
  }

  &.copied {
    color: $grass;
    border-color: $grass;
  }
}
</style>
