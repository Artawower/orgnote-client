<template>
  <q-icon
    @click="clicked"
    :name="fired ? activeIcon : icon"
    size="1rem"
    class="action-btn"
    :class="{ fired, dark: $q.dark.isActive }"
  />
</template>

<script lang="ts" setup>
import { ref, Ref, toRefs } from 'vue';

const emits = defineEmits<{
  (e: 'click'): void;
}>();

const props = defineProps<{
  icon: string;
  activeIcon?: string;
}>();

const { icon, activeIcon } = toRefs(props);

let fired: Ref<boolean> = ref(false);

const showFired = () => {
  fired.value = true;
  setTimeout(() => {
    fired.value = false;
  }, 1000);
};

const clicked = () => {
  showFired();
  emits('click');
};
</script>

<style lang="scss">
.action-btn {
  --btn-action-shadow: 0 1px 0 rgba(27, 31, 36, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  --btn-action-border: 1px solid;
  --btn-action-border-color: var(--base5);
  --btn-action-padding: 6px;
  --btn-action-radius: 6px;
  --btn-action-fire-color: var(--base5);
  --btn-action-fire-border-color: var(--green);
  --btn-action-size: 20px;
  --btn-action-color: var(--base5);
}

.action-btn {
  width: var(--btn-action-size);
  height: var(--btn-action-size);
  color: var(--btn-action-color);
  box-shadow: var(--btn-action-shadow);
  border: var(--btn-action-border);
  border-color: var(--btn-action-border-color);
  border-radius: var(--btn-action-radius);
  padding: var(--btn-action-padding);

  cursor: pointer;

  &.dark {
    color: --base0;
  }

  &.fired {
    color: var(--btn-action-fire-color);
    border-color: var(--btn-action-fire-border-color);
  }
}
</style>
