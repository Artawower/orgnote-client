<template>
  <div class="q-px-md full-width completion-input">
    <div v-if="autocompletion" class="input-overflow color-secondary">
      {{ autocompletion }}
    </div>

    <q-input
      class="completion-input"
      v-model="filter"
      ref="completionInput"
      autofocus
      @blur="closeCompletionOnBlur"
      @keydown.tab.prevent.stop="completeSearchQuery"
      borderless
      :placeholder="$t(placeholder)"
    >
      <template v-slot:prepend>
        <q-icon name="keyboard_arrow_right" />
      </template>
      <template v-slot:append>
        <div class="actions">
          <q-icon
            v-if="$q.platform.is.mobile && autocompletion"
            @click="completeSearchQuery"
            flat
            size="xs"
            name="fas fa-wand-magic-sparkles"
            class="cursor-pointer color-secondary"
          />
          <q-icon
            v-if="
              $q.platform.is.mobile &&
              completionStore.completionMode === 'input'
            "
            @click="completionStore.executeCandidate"
            flat
            size="xs"
            name="send"
            class="cursor-pointer color-secondary"
          />
          <q-icon
            @click="completionStore.closeCompletion"
            flat
            name="close"
            class="cursor-pointer color-secondary"
          />
        </div>
      </template>
    </q-input>
  </div>
</template>

<script lang="ts" setup>
import { storeToRefs } from 'pinia';
import { useCompletionStore } from 'src/stores';

import { computed } from 'vue';

const completionStore = useCompletionStore();
const { filter, placeholder } = storeToRefs(completionStore);

const closeCompletionOnBlur = () => {
  setTimeout(() => {
    completionStore.closeCompletion();
  }, 10);
};

const completeSearchQuery = () => {
  if (!autocompletion.value) {
    return;
  }
  filter.value = autocompletion.value;
};

// TODO: add support for multiple autocompletion for each word by regexp
const autocompletion = computed(() => {
  if (!completionStore.searchAutocompletions || !filter.value) {
    return null;
  }

  const matchedAutocompletion = completionStore.searchAutocompletions.find(
    (ac) => ac.toLowerCase().includes(filter.value.toLowerCase())
  );

  return matchedAutocompletion;
});
</script>

<style lang="scss" scoped>
.completion-input {
  height: var(--completion-input-height);
  position: relative;

  input,
  .q-icon {
    color: var(--fg) !important;
  }

  input::placeholder {
    color: var(--fg-alt) !important;
  }
}

.input-overflow {
  @include flexify(row, flex-start, center);

  position: absolute;
  top: -0.5px;
  left: 52.5px;
  height: 56px;
}

.actions {
  @include flexify();

  gap: var(--gap-sm);
}
</style>
