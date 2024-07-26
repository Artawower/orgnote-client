<template>
  <template v-if="notes?.length">
    <div v-for="n in notes" :key="n.id" class="note-relative-path">
      <q-icon
        v-if="beforeActionIcon"
        :name="beforeActionIcon"
        @click="emits('beforeActionIcon', n)"
        role="button"
        class="action-icon pa-r-sm color-red active"
        size="xs"
      />
      <router-link
        class="link note-path"
        :to="{ name: RouteNames.NoteDetail, params: { id: n.id } }"
      >
        ~/{{ n.filePath.join('/') }}
      </router-link>
    </div>
  </template>
  <no-data v-else-if="emptyText">
    {{ $t(emptyText) }}
  </no-data>
</template>

<script lang="ts" setup>
import { RouteNames } from 'src/router/routes';

import NoData from 'src/components/ui/NoData.vue';
import { Note, NotePreview } from 'orgnote-api';

defineProps<{
  notes?: (NotePreview | Note)[];
  emptyText?: string;
  beforeActionIcon?: string;
}>();

const emits = defineEmits<{
  (e: 'beforeActionIcon', note: NotePreview | Note): void;
}>();
</script>

<style scoped lang="scss">
.note-relative-path {
  padding: calc(var(--block-padding-sm) / 2);
  cursor: pointer;

  @include line-limit(1);
}

.action-icon {
  top: -2px;
}

.note-path {
  font-style: italic;
}
</style>
