<template>
  <div class="property-drawer">
    <div class="info line-limit-1">
      <template v-if="node.parent?.meta?.id">
        id:{{ node.parent?.meta?.id }}
      </template>
    </div>
    <div v-if="!readonly" class="actions">
      <icon-btn
        @click.stop.prevent="openPropertyDrawerEditDialog"
        name="o_more_vert"
      />
    </div>
  </div>
  <q-dialog
    v-model="dialog"
    persistent
    class="all-pointer-events"
    :maximized="$q.screen.lt.sm"
  >
    <div class="property-drawer-editor">
      <property-drawer-editor
        :properties="node.rawValue"
        @change="updateProperties"
        @cancel="() => (dialog = false)"
      />
    </div>
  </q-dialog>
</template>

<script lang="ts" setup>
import { OrgComponentProps } from './org-component-props';

import { ref, toRef } from 'vue';

import IconBtn from './ui/IconBtn.vue';
import PropertyDrawerEditor from './ui/PropertyDrawerEditor.vue';

const props = defineProps<OrgComponentProps>();

const emits = defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const node = toRef(props, 'node');

const dialog = ref<boolean>(false);

const openPropertyDrawerEditDialog = () => {
  dialog.value = true;
};

const updateProperties = (properties: string) => {
  dialog.value = false;
  emits('update', properties);
};
</script>

<style lang="scss" scoped>
.property-drawer {
  @include flexify(row, space-between, center);

  width: 100%;
  border-bottom: 1px solid var(--base7);
  padding: var(--block-default-padding) 0;
  box-sizing: border-box;
}
.info {
  color: var(--fg);
}

.property-drawer-editor {
  width: 600px;
  background: var(--bg);

  @include mobile {
    width: 100%;
  }
}
</style>
