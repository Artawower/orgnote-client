import { defineBoot } from '#q-app/wrappers';
import { debounce } from 'quasar';
import { wsClient, initWebSocketClient } from 'src/infrastructure/websocket-client';
import { api as axiosInstance } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth';
import { useSyncStore } from 'src/stores/sync';
import { useConfigStore } from 'src/stores/config';
import { watch } from 'vue';
import { logger } from 'src/boot/logger';

export default defineBoot(({ store }) => {
  const authStore = useAuthStore(store);
  const syncStore = useSyncStore(store);
  const configStore = useConfigStore(store);

  const debouncedSync = debounce(() => {
    logger.info('Received sync event from WebSocket');
    syncStore.sync();
  }, 1000);

  const reinitWebSocket = () => {
    if (wsClient) {
      wsClient.off('sync', debouncedSync);
    }
    const client = initWebSocketClient({
      apiUrl: configStore.config.network.apiUrl,
      wsUrl: configStore.config.network.wsUrl,
    });

    client.on('sync', debouncedSync);
    if (authStore.token) {
      client.connect(authStore.token);
    }
  };

  reinitWebSocket();

  watch(
    [
      () => configStore.config.network.apiUrl,
      () => configStore.config.network.wsUrl,
    ],
    reinitWebSocket,
  );

  watch(
    () => authStore.token,
    (token: string) => {
      if (token) {
        wsClient.connect(token);
        return;
      }
      wsClient.disconnect();
    },
    { immediate: true },
  );

  axiosInstance.interceptors.request.use((config) => {
    if (wsClient.socketId) {
      config.headers['X-Socket-ID'] = wsClient.socketId;
    }
    return config;
  });

});
