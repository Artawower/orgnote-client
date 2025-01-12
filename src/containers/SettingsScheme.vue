<template>
  <div class="settings-scheme">
    <h5 class="capitalize description">{{ name }}</h5>
    <card-wrapper background="var(--bg-alt2)">
      <menu-item
        v-for="(scheme, name) of scheme.entries as Record<string, any>"
        :path="getNestedPath(name)"
        :key="name"
      >
        <div class="capitalize">
          {{ camelCaseToWords(name) }}
        </div>
      </menu-item>
    </card-wrapper>
  </div>
</template>

<script lang="ts" setup>
import CardWrapper from 'src/components/CardWrapper.vue';
import MenuItem from './MenuItem.vue';
import { camelCaseToWords } from 'src/utils/camel-case-to-words';

const props = defineProps<{
  path: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scheme: Record<string, any>;
}>();

const getNestedPath = (path: string) => `${props.path}.${path}`;
</script>

<style lang="scss" scoped>
.settings-scheme {
  width: 100%;
}
</style>
