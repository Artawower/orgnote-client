<template>
  <div class="settings-scheme">
    <h5 v-if="name" class="capitalize description">{{ name.toUpperCase() }}</h5>
    <card-wrapper background="bg-alt2">
      <settings-item
        v-for="(scheme, name) of entries as Record<string, any>"
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

const props = defineProps<{
  path: string;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  entries: Record<string, any>;
}>();

console.log('[line 27]: ', props.entries);
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
