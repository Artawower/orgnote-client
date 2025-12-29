<template>
  <div class="org-multiline-widget" @touchstart.stop.prevent @mousedown.stop.prevent>
    <slot :actionsId="actionsId" />
    <app-flex row-reverse :id="actionsId" class="org-widget-actions" gap="sm">
      <action-button
        v-if="!suppressEdit && !readonly"
        icon="edit_note"
        color="fg-muted"
        size="sm"
        @click="handleEditClick"
      />
    </app-flex>
  </div>
</template>

<script lang="ts" setup>
import { v4 } from 'uuid';
import ActionButton from 'src/components/ActionButton.vue';
import AppFlex from 'src/components/AppFlex.vue';

defineProps<{
  suppressEdit?: boolean;
  readonly?: boolean;
}>();

const emit = defineEmits<{
  edit: [];
}>();

const actionsId = `widget-actions-${v4()}`;

const handleEditClick = (event: MouseEvent) => {
  event.preventDefault();
  emit('edit');
};
</script>

<style lang="scss" scoped>
.org-multiline-widget {
  position: relative;
  margin-top: var(--margin-md);
  width: 100%;
  overflow: auto;
}

.org-widget-actions {
  position: absolute;
  top: var(--gap-sm);
  right: var(--gap-sm);
  z-index: 1000;
  opacity: 0;
}

.org-multiline-widget:hover .org-widget-actions,
.org-multiline-widget:active .org-widget-actions {
  opacity: 1;
}

@media (max-width: 768px) {
  .org-widget-actions {
    right: var(--padding-md);
    top: var(--padding-md);
    opacity: 1;
    display: none;
  }

  .org-multiline-widget:hover .org-widget-actions {
    display: flex;
  }
}
</style>
