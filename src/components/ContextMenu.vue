<template>
  <div
    ref="wrapperRef"
    v-touch-hold.mouse:500="handleTrigger"
    class="context-menu-trigger"
    @contextmenu.stop.prevent="handleTrigger"
  >
    <slot />
    <q-menu
      v-if="!disabled && !desktopBelow"
      ref="qMenuRef"
      class="context-menu"
      context-menu
      @hide="close"
    >
      <menu-list :actions="actions" :data="data" @close="close" />
    </q-menu>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue';
import { QMenu } from 'quasar';
import type { MenuAction, MenuGroup } from 'orgnote-api';
import MenuList from './MenuList.vue';
import { api } from 'src/boot/api';

const props = defineProps<{
  group: MenuGroup;
  data?: unknown;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  open: [];
}>();

const qMenuRef = ref<InstanceType<typeof QMenu>>();
const wrapperRef = ref<HTMLElement>();

const contextMenuStore = api.ui.useContextMenu();
const { desktopBelow } = api.ui.useScreenDetection();
const modal = api.ui.useModal();

const actions = computed<MenuAction[]>(() => contextMenuStore.getContextMenuActions(props.group));

const handleTrigger = () => {
  if (props.disabled) return;
  if (desktopBelow.value) {
    openMobileMenu();
    return;
  }
  open();
};

const openMobileMenu = () => {
  emit('open');
  modal.open(MenuList, {
    mini: true,
    position: 'bottom',
    modalProps: {
      actions: actions.value,
      data: props.data,
    },
    modalEmits: {
      close: () => modal.close(),
    },
  });
};

const open = () => {
  emit('open');
  qMenuRef.value?.show();
};

const close = () => {
  qMenuRef.value?.hide();
};

defineExpose({
  open,
  close,
});
</script>

<style lang="scss" scoped>
.context-menu-trigger {
  display: contents;
  @include interactive-no-select;
}
</style>
