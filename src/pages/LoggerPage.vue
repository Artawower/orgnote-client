<template>
  <div class="logger-page">
    <div class="capitalize q-pb-md q-px-sm">
      {{
        $t(
          'this information is available only on your device. It will not be sent to the server. You are free to use it for a GitHub issue.'
        )
      }}
    </div>
    <div class="system-info">
      <code-block :code="prettyLogs">
        <template v-slot:actions>
          <action-btn
            @click="loggerStore.clearLogs"
            icon="o_delete_forever"
            active-icon="done"
          />
        </template>
      </code-block>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';

import ActionBtn from 'src/components/ui/ActionBtn.vue';
import CodeBlock from 'src/components/ui/CodeBlock.vue';
import { useLoggerStore } from 'src/stores/logger';

const loggerStore = useLoggerStore();
const { prettyLogs } = storeToRefs(loggerStore);
</script>

<style lang="scss" scoped>
.logger-page {
  padding: var(--block-padding-md);
}
</style>
