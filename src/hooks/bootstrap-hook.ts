import { useExtensionsStore } from 'src/stores';
import { ref } from 'vue';
import { onBeforeMount } from 'vue';

export function useBootstrap() {
  const extensionsStore = useExtensionsStore();
  const appReady = ref<boolean>(false);

  onBeforeMount(async () => {
    await extensionsStore.loadActiveExtensions();
    await extensionsStore.loadExtensions();
    await extensionsStore.initBuiltInExtensions();
    appReady.value = true;
  });

  const bootstrapped = appReady;

  return {
    bootstrapped,
  };
}
