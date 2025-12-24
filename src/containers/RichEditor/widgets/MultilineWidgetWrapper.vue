<template>
  <div class="org-multiline-widget" @touchstart.stop.prevent @mousedown.stop.prevent>
    <slot />
    <action-button
      v-if="!suppressEdit && !readonly"
      class="org-widget-edit-badge"
      icon="edit_note"
      border
      color="fg-muted"
      size="sm"
      @click="handleEditClick"
    />
  </div>
</template>

<script lang="ts" setup>
import ActionButton from 'src/components/ActionButton.vue';

defineProps<{
  suppressEdit?: boolean;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  edit: [];
}>();

const handleEditClick = (event: MouseEvent) => {
  event.preventDefault();
  emit('edit');
};
</script>

<style lang="scss" scoped>
.org-multiline-widget {
  position: relative;
}

.org-widget-edit-badge {
  position: absolute;
  opacity: 0;
  z-index: 1000;
  right: 16px;
  top: var(--gap-sm);
}

.org-widget-edit-badge:hover {
  opacity: 1;
}

.org-multiline-widget {
  margin-top: var(--margin-md);
  width: 100%;
  overflow: auto;
}

.org-multiline-widget:hover .org-widget-edit-badge,
.org-multiline-widget:active .org-widget-edit-badge {
  opacity: 1;
}

@media (max-width: 768px) {
  .org-widget-edit-badge {
    right: 8px;
    top: 8px;
    opacity: 1;
    left: unset;
    display: none;
  }

  .org-multiline-widget:hover .org-widget-edit-badge {
    display: block;
  }
}
</style>
