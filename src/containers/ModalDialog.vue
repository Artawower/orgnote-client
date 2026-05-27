<template>
  <app-flex
    tag="dialog"
    column
    start
    align-stretch
    @pointerdown="handleDialogPointerDown"
    @pointerup="handleDialogPointerUp"
    @click="handleDialogClick"
    @cancel.prevent="modal.close()"
    :class="{
      mini: modalData.config?.mini,
      [`position-${modalData.config?.position ?? 'center'}`]:
        modalData.config?.position ?? 'center',
      'full-screen': modalData.config?.fullScreen,
      'modal-wide': modalData.config?.wide,
      'keyboard-fit': modalData.config?.mini && keyboardHeight > 0,
    }"
    ref="dialogRef"
  >
    <app-flex
      :tag="modalData.config?.mini ? 'div' : SafeArea"
      column
      start
      align-stretch
      class="safe-area-wrapper"
    >
      <app-flex
        class="modal-content"
        column
        start
        align-start
        :gap="modalData.config?.noHeaderPadding ? '0px' : 'var(--modal-padding)'"
        :class="{ 'no-header-padding': modalData.config?.noHeaderPadding }"
      >
        <app-flex
          v-if="modalData.config?.headerTitleComponent || modalData.config?.title"
          class="modal-header"
          row
          between
          align-center
        >
          <component
            v-if="modalData.config?.headerTitleComponent"
            :is="modalData.config.headerTitleComponent"
          />
          <h1 v-else-if="modalData.config?.title" class="title capitalize">
            {{ t(modalData.config.title) }}
          </h1>
          <action-button @click="modal.close" icon="close" size="sm" />
        </app-flex>
        <div class="content">
          <div
            class="content-body"
            :class="{
              'no-padding': modalData.config?.noBodyPadding,
              'with-header': modalData.config?.headerTitleComponent || modalData.config?.title,
            }"
          >
            <component
              :is="modalData.component"
              v-bind="modalData.config?.modalProps"
              v-on="modalData.config?.modalEmits ?? {}"
            />
          </div>
        </div>
      </app-flex>
    </app-flex>
    <app-notifications />
  </app-flex>
</template>

<script lang="ts" setup>
import type { Modal } from 'orgnote-api';
import { api } from 'src/boot/api';
import ActionButton from 'src/components/ActionButton.vue';
import SafeArea from 'src/components/SafeArea.vue';
import AppNotifications from './AppNotifications.vue';
import AppFlex from 'src/components/AppFlex.vue';
import { computed, onMounted, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useKeyboardState } from 'src/composables/use-viewport-behavior';

defineProps<{ modalData: Modal }>();

const modal = api.ui.useModal();
const dialogRef = ref<InstanceType<typeof AppFlex>>();
const { keyboardHeight: keyboardHeightRef } = useKeyboardState();

const keyboardHeight = computed(() => keyboardHeightRef.value);

const getDialogElement = (): HTMLDialogElement | undefined =>
  dialogRef.value?.$el as HTMLDialogElement | undefined;

onMounted(() => {
  getDialogElement()?.showModal();
});

onBeforeUnmount(() => {
  const el = getDialogElement();
  if (el?.open) {
    el.close();
  }
});

const shouldCloseFromBackdrop = (event: Event) => event.target === event.currentTarget;

let backdropPointerDownId: number | null = null;

const handleDialogPointerDown = (event: PointerEvent) => {
  backdropPointerDownId = shouldCloseFromBackdrop(event) ? event.pointerId : null;
};

const handleDialogPointerUp = (event: PointerEvent) => {
  if (!shouldCloseFromBackdrop(event) || event.pointerId !== backdropPointerDownId) return;
  backdropPointerDownId = null;
  modal.close();
};

const handleDialogClick = (e: MouseEvent) => {
  if (shouldCloseFromBackdrop(e)) {
    modal.close();
  }
};

const { t } = useI18n({
  useScope: 'global',
  inheritLocale: true,
});
</script>

<style lang="scss" scoped>
dialog:not([open]) {
  display: none;
}

dialog {
  & {
    min-width: var(--modal-min-width);
    max-width: var(--modal-max-width);
    max-height: var(--modal-max-height);
    margin: auto;
    border: var(--modal-border);
    border-radius: var(--modal-radius);
    padding: 0;
    position: fixed;
  }

  &:not(.full-screen) {
    max-width: var(--modal-max-width);
    max-height: var(--modal-max-height);
  }

  &::backdrop {
    background-color: var(--modal-backdrop-bg);
  }
}

.modal-wide {
  width: var(--modal-max-width);

  @include tablet-above {
    height: var(--modal-max-height);
  }
}

:deep(.safe-area) {
  & {
    min-height: 0;
  }
}

@include desktop-below {
  dialog {
    &:not(.mini) {
      width: 100%;
      border-radius: 0;
      height: calc(var(--initial-viewport-height, 100vh) - var(--keyboard-height, 0px)) !important;
      max-height: calc(
        var(--initial-viewport-height, 100vh) - var(--keyboard-height, 0px)
      ) !important;
      top: 0 !important;
      bottom: unset;
      margin: 0;
    }

    &:not(.mini)::backdrop {
      display: none;
    }

    &.mini {
      top: unset;
      bottom: 0;
      width: 100%;
      height: fit-content;
      max-height: 60vh;
    }
  }
}

@include desktop-below {
  dialog.mini.keyboard-fit {
    top: 0;
    bottom: unset;
    height: var(--screen-height, 100vh);
    max-height: var(--screen-height, 100vh);

    .safe-area-wrapper {
      height: 100%;
    }

    .modal-content,
    .content {
      flex: 1 1 auto !important;
      min-height: 0;
    }

    .modal-content {
      overflow: hidden;
    }

    .content {
      overflow-y: auto;
      overscroll-behavior-y: contain;
    }
  }

  dialog.keyboard-fit::backdrop {
    display: none;
  }
}

@include desktop {
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

.modal-content {
  & {
    width: 100%;
    flex: 1 1 auto;
    min-height: 0;
    overflow: hidden;
    padding-bottom: var(--device-padding-bottom, 0px);
  }

  &:not(.no-header-padding) .modal-header {
    padding: var(--modal-padding);
    padding-bottom: 0;
  }

  div {
    width: 100%;
  }
}

.content {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
  width: 100%;

  @include desktop-below {
    overscroll-behavior-y: contain;
  }
}

.content-body {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  width: 100%;

  &:not(.no-padding) {
    padding: var(--modal-padding);
  }

  &.with-header {
    padding-top: 0;
  }
}

.safe-area-wrapper {
  height: 100%;
}

@include desktop-below {
  dialog.mini:not(.keyboard-fit) {
    .safe-area-wrapper {
      height: auto;
    }

    .modal-content {
      flex: 0 0 auto;
    }

    .content {
      flex: 0 0 auto;
    }
  }
}

@include desktop {
  .safe-area-wrapper {
    height: 100%;
  }

  .modal-content {
    flex: 1 1 auto;
  }

  .content {
    flex: 1;
  }
}
</style>
