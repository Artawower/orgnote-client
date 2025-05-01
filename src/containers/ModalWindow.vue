<template>
  <animation-wrapper v-for="(m, i) of modals" :key="i">
    <dialog
      @mousedown="handleDialogClick"
      @close="modal.close()"
      :class="{
        mini: m.config?.mini,
        [`position-${m.config?.position ?? 'center'}`]: m.config.position,
        'full-screen': m.config?.fullScreen,
      }"
      :ref="
        (el) => {
          if (el) {
            modalDialogRefs[i] = el as HTMLDialogElement;
          }
        }
      "
    >
      <safe-area :enabled="!m.config?.mini">
        <div class="modal-content" :class="{ 'no-padding': m.config?.noPadding }">
          <div v-if="m.config?.headerTitleComponent || m.config?.title" class="modal-header">
            <component v-if="m.config?.headerTitleComponent" :is="m.config.headerTitleComponent" />
            <h1 v-else-if="m.config?.title" class="title capitalize">
              {{ t(m.config.title) }}
            </h1>
            <action-button @click="modal.close" icon="close" size="sm" />
          </div>
          <div class="content">
            <component
              :is="m.component"
              v-bind="m.config?.modalProps"
              v-on="m.config?.modalEmits ?? {}"
            />
          </div>
        </div>
      </safe-area>
    </dialog>
  </animation-wrapper>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import ActionButton from 'src/components/ActionButton.vue';
import AnimationWrapper from 'src/components/AnimationWrapper.vue';
import SafeArea from 'src/components/SafeArea.vue';
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
  if (target === e.currentTarget) {
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
  max-width: var(--modal-max-width);
  max-height: var(--modal-max-height);

  border: var(--modal-border);
  border-radius: var(--modal-border-radius);
  padding: 0;
  position: fixed;

  &:not(.full-screen) {
    max-width: var(--modal-max-width);
    max-height: var(--modal-max-height);
  }

  &::backdrop {
    background-color: var(--modal-backdrop-bg);
  }
}

@include desktop-below {
  dialog {
    &:not(.mini) {
      width: 100%;
      height: var(--screen-height);
      top: 0;
      bottom: 0;
    }

    &.mini {
      top: unset;
      bottom: 0;
      width: 100%;
    }
  }
}

@include tablet-above {
  dialog.position-top {
    margin: 0;
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    top: var(--padding-xl);
  }
}

dialog.full-screen {
  width: 100%;
  height: 100%;
  max-width: unset;
  max-height: unset;
  top: 0;
  border-radius: 0;
}

.modal-header {
  @include flexify(row, space-between, center);
}

.modal-content {
  @include flexify(column, flex-start, flex-start, var(--modal-padding));

  & {
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  &:not(.no-padding) {
    padding: var(--modal-padding);
  }

  div {
    width: 100%;
  }
}

.content {
  display: flex;
  overflow: hidden;
  max-height: var(--viewport-height);
  height: 100%;
}
</style>
