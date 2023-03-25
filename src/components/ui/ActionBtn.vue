<template>
  <q-icon
    @click="clicked"
    :name="fired ? icon : activeIcon"
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
 }>()

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
  width: var(--action-btn-size);
  height: var(--action-btn-size);
  color: var(--action-btn-color);
  box-shadow: var(--action-btn-shadow);
  border: var(--action-btn-border);
  border-color: var(--action-btn-border-color);
  border-radius: var(--action-btn-radius);
  padding: var(--action-btn-padding);

  cursor: pointer;

  &.dark {
    color: $light;
  }

  &.fired {
    color: var(--action-btn-fire-color);
    border-color: var(--action-btn-fire-border-color);
  }
}
</style>
