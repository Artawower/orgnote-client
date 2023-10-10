<template>
  <div class="modal-container">
    <q-btn
      class="close-btn color-secondary"
      v-close-popup
      icon="close"
      flat
      rounded
      size="sm"
    />
    <div class="modal-title full-width text-capitalize color-secondary text-h5">
      <slot name="title" />
    </div>
    <div class="modal-content full-width">
      <slot name="content" />
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style lang="scss" scoped>
.modal-title {
  padding: 8px 16px;
}

.modal-container {
  @include flexify(column, flex-start, flex-start);

  padding: var(--page-padding);

  background: var(--bg);
  position: relative;
  width: 100%;
  height: 100%;

  @include tablet-plus {
    max-height: var(--modal-max-height);
  }

  max-width: var(--modal-max-width) !important;
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;

  z-index: 7;
}

.modal-content {
  flex: 1;
}

.q-btn {
  padding: 1px 6px;
}
</style>
