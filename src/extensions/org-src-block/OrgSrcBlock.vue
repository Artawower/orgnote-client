<template>
  <div class="src-code-wrapper">
    <Teleport :to="`#${props.actionsId}`" v-if="props.actionsId && isMounted">
      <action-button
        @click="copySrc"
        icon="content_copy"
        fire-icon="done"
        size="sm"
        color="fg-muted"
        fire-color="green"
      />
      <action-button
        @click="executeCode"
        icon="play_arrow"
        fire-icon="done"
        size="sm"
        color="fg-muted"
        fire-color="green"
      />
    </Teleport>
    <highlightjs autodetect :code="codeContent" />
  </div>
</template>

<script setup lang="ts">
import type { OrgNode } from 'org-mode-ast';
import { computed, ref, onMounted } from 'vue';
import ActionButton from 'src/components/ActionButton.vue';
import { copyToClipboard } from 'src/utils/clipboard';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import { to } from 'orgnote-api/utils';
import hljsVuePlugin from '@highlightjs/vue-plugin';

const highlightjs = hljsVuePlugin.component;

const props = defineProps<{
  node: OrgNode;
  nodeGetter?: () => OrgNode;
  readonly?: boolean;
  actionsId?: string;
}>();

const emits = defineEmits<{
  (e: 'update', newValue: string): void;
}>();

const isMounted = ref(false);
onMounted(() => {
  isMounted.value = true;
});

const currentNode = computed(() => props.nodeGetter?.() ?? props.node);

const codeContent = computed(
  () => currentNode.value?.children?.get(2)?.rawValue ?? currentNode.value?.rawValue ?? '',
);

const copySrc = () => {
  const content = currentNode.value.children?.get(2)?.rawValue;
  if (content) {
    copyToClipboard(content);
  }
};

const babelStore = api.core.useBabel();

const language = computed(() => {
  const firstChild = currentNode.value.children?.first?.children?.first?.children;
  return firstChild?.length === 2 ? firstChild.last.rawValue.trim() : 'source code';
});

const executeCodeSafe = to(
  (lang: string, code: string) => babelStore.execute(lang, code),
  'Code execution failed',
);

const executeCode = async () => {
  const code = currentNode.value.children?.get(2)?.rawValue;
  if (!code) return;

  const result = await executeCodeSafe(language.value, code);
  result.match(
    (res) => emits('update', res),
    (err) => reporter.reportError(err),
  );
};
</script>

<style lang="scss" scoped>
.src-code-wrapper {
  pre {
    margin: 0 !important;

    code {
      padding: var(--src-block-padding-y, var(--padding-md))
        var(--src-block-padding-x, var(--padding-md));
      border-radius: var(--border-radius-sm);
    }
  }
}
</style>
