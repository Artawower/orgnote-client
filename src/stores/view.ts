import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

export const useViewStore = defineStore(
  'view',
  () => {
    const tile = ref<boolean>(false);
    const loadingCount = ref<number>(0);
    const completionPosition = ref<'float' | 'bottom'>('float');

    const hasGlobalLoading = computed(() => loadingCount.value > 0);

    const toggleTile = () => (tile.value = !tile.value);
    const addLoading = () => (loadingCount.value += 1);
    const removeLoading = () => (loadingCount.value -= 1);

    return {
      tile,
      loadingCount,

      hasGlobalLoading,

      toggleTile,
      addLoading,
      removeLoading,
      completionPosition,
    };
  },
  { persist: true }
);
