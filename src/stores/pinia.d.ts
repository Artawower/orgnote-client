import 'pinia';
import type { Router } from 'vue-router';
import { useFileSystemStore } from 'src/hooks/files-system';

declare module 'pinia' {
  export interface PiniaCustomProperties {
    router: Router;
    readonly graphWorker: WorkerConnection;
  }
}
