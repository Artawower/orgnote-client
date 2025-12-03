<template>
  <animation-wrapper v-for="(m, i) of modals" :key="i">
    <app-flex
      tag="dialog"
      column
      start
      align-stretch
      @mousedown="handleDialogClick"
      @close="modal.close()"
      :class="{
        mini: m.config?.mini,
        [`position-${m.config?.position ?? 'center'}`]: m.config?.position ?? 'center',
        'full-screen': m.config?.fullScreen,
        'modal-wide': m.config?.wide,
      }"
      :ref="
        (el) => {
          if (el) {
            const component = el as InstanceType<typeof AppFlex>;
            modalDialogRefs[i] = component.$el as HTMLDialogElement;
          }
        }
      "
    >
      <app-flex
        :tag="SafeArea"
        :enabled="!m.config?.mini"
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
          :gap="m.config?.noPadding ? '0px' : 'var(--modal-padding)'"
          :class="{ 'no-padding': m.config?.noPadding }"
        >
          <app-flex
            v-if="m.config?.headerTitleComponent || m.config?.title"
            class="modal-header"
            row
            between
            align-center
          >
            <component v-if="m.config?.headerTitleComponent" :is="m.config.headerTitleComponent" />
            <h1 v-else-if="m.config?.title" class="title capitalize">
              {{ t(m.config.title) }}
            </h1>
            <action-button @click="modal.close" icon="close" size="sm" />
          </app-flex>
          <div class="content">
            <component
              :is="m.component"
              v-bind="m.config?.modalProps"
              v-on="m.config?.modalEmits ?? {}"
            />
          </div>
        </app-flex>
      </app-flex>
      <app-notifications />
    </app-flex>
  </animation-wrapper>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { api } from 'src/boot/api';
import ActionButton from 'src/components/ActionButton.vue';
import AnimationWrapper from 'src/components/AnimationWrapper.vue';
import SafeArea from 'src/components/SafeArea.vue';
import AppNotifications from 'src/components/AppNotifications.vue';
import { nextTick, watch } from 'vue';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import AppFlex from 'src/components/AppFlex.vue';

const modal = api.ui.useModal();
const { modals } = storeToRefs(modal);

const modalDialogRefs = ref<HTMLDialogElement[]>([]);

const initDialog = async () => {
  await nextTick();
  modalDialogRefs.value[modals.value.length - 1]?.showModal();
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
  & {
    min-width: var(--modal-min-width);
    max-width: var(--modal-max-width);
    max-height: var(--modal-max-height);
    margin: auto;
    border: var(--modal-border);
    border-radius: var(--modal-border-radius);
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
    flex: 1 1 auto;
    min-height: 0;
  }
}

@include desktop-below {
  dialog {
    &:not(.mini) {
      width: 100%;
      height: var(--screen-height);
      top: 0;
      bottom: 0;
      margin: 0;
    }

    &.mini {
      top: unset;
      bottom: 0;
      width: 100%;
    }
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

  &:not(.no-padding) {
    padding: var(--modal-padding);
    padding-bottom: calc(var(--modal-padding) + var(--device-padding-bottom, 0px));
  }

  div {
    width: 100%;
  }
}

.content {
  display: flex;
  flex: 1 1 auto;
  min-height: 0;
}
</style>
