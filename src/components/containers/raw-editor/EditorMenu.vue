<template>
  <div class="cm-editor-actions">
    <div role="button" class="cm-editor-menu">
      <q-icon name="drag_indicator" size="sm"> </q-icon>
    </div>
    <div role="button" class="cm-editor-menu">
      <q-icon name="add_box" size="sm"> </q-icon>
    </div>
  </div>
</template>

<script lang="ts" setup></script>

<style scoped lang="scss">
.cm-editor-menu {
  color: var(--fg-alt);
  cursor: pointer;

  &:hover {
    color: var(--cyan);
  }
}
.cm-editor-actions {
  @include flexify();
}
</style>
