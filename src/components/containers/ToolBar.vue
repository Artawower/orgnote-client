<template>
  <q-footer class="toolbar" reveal>
    <div class="footer-wrapper fit flex rows justify-between items-center">
      <div
        v-for="(action, i) in toolbarStore.actions"
        :key="action.name"
        class="flex toolbar-action justify-center items-center cursor-pointer"
        :class="{ 'main-action': i === 2 }"
        @click="action.handler"
      >
        <q-icon
          class="color-main"
          :name="action.icon"
          :size="i === 2 ? 'lg' : 'md'"
        ></q-icon>
      </div>
    </div>
  </q-footer>
</template>

<script lang="ts" setup>
import { useToolbarStore } from 'src/stores';

const toolbarStore = useToolbarStore();
</script>

<style lang="scss" scoped>
.toolbar {
  height: var(--sidebar-width);
  background: var(--bg-alt);
  border: var(--tolbar-border);
  border-top: var(--toolbar-border-top);
}

.toolbar-action {
  flex: 1;
  box-sizing: border-box;

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

.main-action {
  min-width: var(--sidebar-width);
  min-height: var(--sidebar-width);
  max-width: var(--sidebar-width);
  max-height: var(--sidebar-width);
  border-radius: 50%;
  position: relative;
  top: -50%;
  background: var(--bg-alt);
  border: var(--tolbar-border);
  border-top: var(--toolbar-border-top);
}
</style>
