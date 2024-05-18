<template>
  <q-footer v-show="toolbarStore.showToolbar" class="toolbar" reveal>
    <div class="footer-wrapper fit flex rows justify-between items-center">
      <div
        v-for="action in toolbarStore.actions"
        :key="action.command"
        class="flex toolbar-action justify-center items-center cursor-pointer"
        @click="executeCommand(action)"
      >
        <q-icon
          class="color-main"
          :name="extractDynamicValue(action.icon)"
          size="md"
        ></q-icon>
      </div>
    </div>
  </q-footer>
</template>

<script lang="ts" setup>
import { useKeybindingStore } from 'src/stores/keybindings';
import { useToolbarStore } from 'src/stores/toolbar';
import { extractDynamicValue } from 'src/tools';

const toolbarStore = useToolbarStore();
const { executeCommand } = useKeybindingStore();
</script>

<style lang="scss" scoped>
.toolbar {
  height: var(--footer-height);
  background: var(--bg-alt);
  border: var(--tolbar-border);
  border-top: var(--toolbar-border-top);
}

.toolbar-action {
  flex: 1;
  box-sizing: border-box;
  height: 100%;
  width: 100%;

  &:hover,
  &:active {
    .q-icon {
      color: var(--toolbar-hover-color);
    }
  }
}

.footer-wrapper {
  position: relative;
}

.standalone {
  .toolbar {
    padding-bottom: var(--standalone-bottom-padding);
    height: calc(
      var(--footer-height) + var(--device-padding-bottom)
    ) !important;
  }
}
</style>
