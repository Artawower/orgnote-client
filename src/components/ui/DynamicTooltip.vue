<template>
  <span @click.prevent.stop="showMobile">
    <slot name="content" />
    <q-tooltip
      v-if="!$q.platform.is.mobile"
      v-model="showTooltip"
      @show="emits('show', $event)"
      class="date-tooltip"
    >
      <slot name="tooltip" />
    </q-tooltip>
    <q-dialog
      v-model="dialog"
      :full-width="$q.platform.is.mobile"
      :position="position"
    >
      <slot name="tooltip" />
    </q-dialog>
  </span>
</template>

<script lang="ts" setup>
import { QDialogProps, QTooltip, useQuasar } from 'quasar';

import { ref } from 'vue';

defineProps<{ position: QDialogProps['position'] }>();

const emits = defineEmits<{
  (e: 'show', event?: Event): void;
}>();

const dialog = ref(false);
const showTooltip = ref(false);

const $q = useQuasar();
const showMobile = () => {
  dialog.value = !dialog.value;
  emits('show');
};
</script>

<style lang="scss">
.date-tooltip {
  pointer-events: all !important;
}
</style>
