import { computed, ref } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useDragStatus<T = any>(
  source: 'files' | 'browser' | 'both' = 'both'
) {
  const dragCount = ref(0);
  const dragOver = (e: DragEvent) => {
    if (sourceDoesnotPass(source, e)) {
      return;
    }
    dragCount.value++;
    e.preventDefault();
  };

  const dragLeave = (e: DragEvent) => {
    if (sourceDoesnotPass(source, e)) {
      return;
    }
    dragCount.value--;
    e.preventDefault();
  };

  const dragStart = (e: DragEvent, data?: T) => {
    e.dataTransfer.setData('text', JSON.stringify(data));
  };

  const sourceDoesnotPass = (
    source: 'files' | 'browser' | 'both',
    e: DragEvent
  ) => {
    if (source === 'both') {
      return false;
    }
    const isFileSource = isFileDragged(e);
    return (
      (source === 'files' && !isFileSource) ||
      (source === 'browser' && isFileSource)
    );
  };

  const dragInProgress = computed(() => !!dragCount.value);

  const isFileDragged = (e: DragEvent) =>
    e.dataTransfer.types &&
    (e.dataTransfer.types.indexOf
      ? e.dataTransfer.types.indexOf('Files') != -1
      : e.dataTransfer.types.includes('Files'));

  const reset = () => {
    dragCount.value = 0;
  };

  return {
    dragInProgress,
    dragStart,
    dragCount,
    dragOver,
    dragLeave,
    reset,
  };
}
