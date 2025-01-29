<template>
  <menu-item>
    <div class="file-info">
      <app-icon
        :name="file?.type === 'folder' || root ? 'sym_o_folder' : 'sym_o_draft'"
        color="fg-alt"
        size="sm"
      />
      <div class="name">
        <span v-if="root"> .. </span>
        <template v-else>
          {{ file?.name }}
        </template>
      </div>
    </div>
  </menu-item>
</template>

<script lang="ts" setup>
import type { DiskFile } from 'orgnote-api';
import AppIcon from 'src/components/AppIcon.vue';
import MenuItem from './MenuItem.vue';

defineProps<{
  file?: DiskFile;
  root?: boolean;
}>();
</script>

<style lang="scss" scoped>
.file-info {
  @include flexify(row, flex-start, center, var(--gap-sm));
}
</style>
