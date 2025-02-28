<template>
  <q-menu context-menu :target="props.target" ref="qMenuRef">
    <slot />
  </q-menu>
</template>

<script lang="ts" setup>
import { QMenu } from 'quasar';
import { ref } from 'vue';

const props = defineProps<{
  target?: boolean | string | Element | undefined;
}>();

const qMenuRef = ref<InstanceType<typeof QMenu> | null>(null);

const open = () => {
  qMenuRef.value.show();
};

const close = () => {
  qMenuRef.value.hide();
};

defineExpose({
  open,
  close,
});
</script>
