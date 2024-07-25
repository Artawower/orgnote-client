<template>
  <q-dialog
    v-model="model"
    :position="$q.platform.is.mobile ? 'bottom' : 'standard'"
    :no-focus="false"
    @hide="emits('closed')"
  >
    <div class="dialog-content">
      <slot />
    </div>
  </q-dialog>
</template>

<script lang="ts" setup>
const model = defineModel<boolean>();

const emits = defineEmits<{
  (e: 'closed'): void;
}>();
</script>

<style lang="scss">
.dialog-content {
  box-sizing: border-box;
  padding: var(--block-padding-md);
}

@include mobile {
  .dialog-content {
    padding-bottom: calc(
      var(--block-padding-md) + var(--device-padding-bottom)
    );
  }
}

@include desktop {
  .dialog-content {
    background-color: var(--bg);
  }
}
</style>
