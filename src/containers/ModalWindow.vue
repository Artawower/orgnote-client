<template>
  <dialog @click="handleDialogClick" @close="modal.close" ref="modalDialogRef">
    <div class="modal-content">
      <div class="modal-header">
        <h1 v-if="config?.title" class="title capitalize">
          {{ t(config.title) }}
        </h1>
        <action-button @click="modal.close" v-if="config?.closable" icon="close" size="sm" />
      </div>
      <div class="content">
        <component :is="component" />
      </div>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import ActionButton from 'src/components/ActionButton.vue';
import { watch } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const modal = api.ui.useModal();
const { opened, component, config } = storeToRefs(modal);

const modalDialogRef = ref(null);

const initDialog = () => {
  if (opened.value) {
    modalDialogRef.value.showModal();
    return;
  }
  modalDialogRef.value.close();
};

watch(opened, initDialog);

// NOTE: https://stackoverflow.com/a/54267686
const handleDialogClick = (e: MouseEvent) => {
  if (!opened.value) {
    return;
  }
  const target = e.target as HTMLDialogElement;
  if (!target.closest('div.modal-content')) {
    modal.close();
  }
};

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>

<style lang="scss" scoped>
dialog {
  width: 100%;
  height: 100%;
  max-width: var(--modal-max-width);
  max-height: var(--modal-max-height);
  border: var(--modal-border);
  border-radius: var(--modal-border-radius);
  padding: 0;
}

dialog::backdrop {
  background-color: var(--modal-backdrop-bg);
}

.modal-content {
  width: 100%;
  height: 100%;
  padding: var(--modal-padding);
}

.modal-header {
  @include flexify(row, space-between, center);
  padding-bottom: var(--block-padding-sm);
}
</style>
