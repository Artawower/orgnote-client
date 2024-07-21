<template>
  <q-btn
    @click="returnBack"
    size="md"
    class="color-blue"
    flat
    color="blue"
    round
    icon="sym_o_arrow_back_ios"
  />
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

const props = defineProps<{
  to?: string;
}>();

const router = useRouter();

const returnBack = () => {
  if (props.to) {
    router.push(props.to);
  } else {
    router.go(-1);
  }
};
</script>

<style lang="scss" scoped>
:deep(.q-icon) {
  color: var(--blue) !important;
}
</style>
