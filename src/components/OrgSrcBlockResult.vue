<template>
  <div class="src-code-wrapper">
    {{ $t('output') }}
    <highlightjs v-if="content?.value" language="bash" :code="content.value" />
  </div>
</template>

<script setup lang="ts">
import { OrgNode } from 'org-mode-ast';
import { toRef } from 'vue';

const props = defineProps<{
  content?: OrgNode;
}>();

const content = toRef(props, 'content');
</script>
