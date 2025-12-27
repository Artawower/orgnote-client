import { api } from 'src/boot/api';
import { computed, onMounted, onUnmounted, watch, type Ref } from 'vue';

export function useNoteEditor(notePath: Ref<string | undefined>) {
  const store = api.core.useBuffers();

  const currentBuffer = computed(() => {
    if (!notePath.value) return null;
    return store.getBufferByPath(notePath.value);
  });

  onMounted(async () => {
    if (!notePath.value) return;
    await store.getOrCreateBuffer(notePath.value);
  });

  onUnmounted(() => {
    if (!notePath.value) return;
    store.releaseBuffer(notePath.value);
  });

  watch(notePath, async (next, prev) => {
    if (prev) store.releaseBuffer(prev);
    if (next) await store.getOrCreateBuffer(next);
  });

  const noteText = computed({
    get: (): string => {
      const b = currentBuffer.value;
      return b ? b.text : '';
    },
    set: (val: string) => {
      const b = currentBuffer.value;
      if (!b) return;
      b.setText(val);
    },
  });

  const isSaving = computed((): boolean => {
    const b = currentBuffer.value;
    return b ? b.isSaving : false;
  });

  const isLoading = computed((): boolean => {
    const b = currentBuffer.value;
    return b ? b.isLoading : false;
  });

  const saveBuffer = async (): Promise<void> => {
    if (!notePath.value || !currentBuffer.value) return;
    return store.saveAllBuffers();
  };

  const closeBuffer = async (force = false): Promise<boolean> => {
    if (!notePath.value) return true;
    return store.closeBuffer(notePath.value, force);
  };

  return {
    noteText,
    isSaving,
    isLoading,
    saveBuffer,
    closeBuffer,
    currentBuffer,
  };
}
