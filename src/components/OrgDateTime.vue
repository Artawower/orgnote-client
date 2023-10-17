<template>
  <span @click.prevent.stop="showMobile" class="org-date">
    {{ node.rawValue }}
    <q-tooltip
      v-if="!$q.platform.is.mobile"
      :hide-delay="100"
      class="date-tooltip"
    >
      <q-date
        v-model="date"
        landscape
        flat
        readonly
        format-md
        mask="YYYY-MM-DD"
      />
    </q-tooltip>
  </span>
  <q-dialog v-if="$q.platform.is.mobile" v-model="dialog" position="bottom">
    <q-date
      v-model="date"
      landscape
      flat
      readonly
      format-md
      mask="YYYY-MM-DD"
    />
  </q-dialog>
</template>

<script lang="ts" setup>
import { OrgNode } from 'org-mode-ast';
import { useQuasar } from 'quasar';

import { computed, ref } from 'vue';

const props = defineProps<{
  node: OrgNode;
  rootNodeSrc: () => OrgNode;
}>();

defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const date = computed(
  () => props.node.children.get(1).rawValue?.split(' ')?.[0]
);

const dialog = ref(false);
const $q = useQuasar();
const showMobile = () => {
  if (!$q.platform.is.mobile) {
    return;
  }
  dialog.value = true;
};
</script>

<style lang="scss" scoped>
.org-date {
  color: var(--yellow);
  font-weight: 500;
  cursor: pointer;
}
</style>
