<template>
  <div class="settings-scheme">
    <h5 v-if="name" class="capitalize description">{{ name.toUpperCase() }}</h5>
    <card-wrapper background="bg-alt2">
      <settings-item
        v-for="(scheme, name) of props.scheme.entries as Record<string, any>"
        :key="name"
        :name="name"
        :path="path"
        :scheme="scheme"
      ></settings-item>
    </card-wrapper>
  </div>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import SettingsItem from './SettingsItem.vue';
import type { ValibotScheme } from 'src/models/valibot-scheme';

const props = defineProps<{
  path: string;
  name?: string;
  scheme: ValibotScheme;
}>();

console.log('[line 27]: ', props.scheme.entries);
</script>

<style lang="scss" scoped>
.settings-scheme {
  width: 100%;
}

.menu-item-content {
  @include flexify(row, space-between, center);

  width: 100%;
}
</style>
