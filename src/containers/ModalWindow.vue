<template>
  <dialog
    v-for="(m, i) of modals"
    :key="i"
    @click="handleDialogClick"
    @close="modal.close"
    :class="{
      mini: m.config?.mini,
      [`position-${m.config?.position ?? 'center'}`]: m.config.position,
    }"
    :ref="
      (el) => {
        if (el) {
          modalDialogRefs[i] = el as HTMLDialogElement;
        }
      }
    "
  >
    <div class="modal-content" :class="{ 'no-padding': m.config?.noPadding }">
      <div v-if="m.config?.headerTitleComponent || m.config?.title" class="modal-header">
        <component v-if="m.config?.headerTitleComponent" :is="m.config.headerTitleComponent" />
        <h1 v-else-if="m.config?.title" class="title capitalize">
          {{ t(m.config.title) }}
        </h1>
        <action-button @click="modal.close" v-if="m.config?.closable" icon="close" size="sm" />
      </div>
      <div class="content">
        <component :is="m.component" v-bind="m.config?.modalProps" />
      </div>
    </div>
  </dialog>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import ActionButton from 'src/components/ActionButton.vue';
import { nextTick, watch } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const modal = api.ui.useModal();
const { modals } = storeToRefs(modal);

const modalDialogRefs = ref<HTMLDialogElement[]>([]);

const initDialog = async () => {
  await nextTick();
  modalDialogRefs.value[modals.value.length - 1].showModal();
};

const closeDialog = () => {
  modalDialogRefs.value.splice(modals.value.length - 1, 1);
};

watch(modals, async (curr, prev) => {
  const modalAdded = prev.length < curr.length;
  if (modalAdded) {
    await initDialog();
    return;
  }
  closeDialog();
});

// NOTE: https://stackoverflow.com/a/54267686
const handleDialogClick = (e: MouseEvent) => {
  if (!modals.value.length) {
    return;
  }
  const target = e.target as HTMLDialogElement;
  if (!['div.modal-content', 'i', 'button'].some((t) => target.closest(t))) {
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
  &:not(.mini) {
    width: 100%;
    height: 100%;
  }
  max-width: var(--modal-max-width);
  max-height: var(--modal-max-height);
  border: var(--modal-border);
  border-radius: var(--modal-border-radius);
  padding: 0;

  &.position-top {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    margin: 0;
  }

  &.position-top {
    top: var(--block-padding-lg);
  }
}

dialog::backdrop {
  background-color: var(--modal-backdrop-bg);
}

.modal-content {
  @include flexify(column, flex-start, flex-start, var(--modal-padding));

  width: 100%;
  height: 100%;
  overflow: hidden;

  &:not(.no-padding) {
    padding: var(--modal-padding);
  }

  div {
    width: 100%;
  }
}

.modal-header {
  @include flexify(row, space-between, center);
}

.content {
  display: flex;
  overflow: hidden;
}
</style>
