import { useExtensionsStore } from 'src/stores/extensions';
import { ref } from 'vue';
import { onBeforeMount } from 'vue';

export function useBootstrap() {
  const appReady = ref<boolean>(!process.env.CLIENT);

  const extensionsStore = useExtensionsStore();

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
