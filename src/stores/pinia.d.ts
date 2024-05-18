import 'pinia';
import { Repositories } from 'src/models';
import type { Router } from 'vue-router';
import type {
  Database,
  NoteRepository,
  FileRepository,
  ExtensionRepository,
} from 'src/repositories';

declare module 'pinia' {
  export interface PiniaCustomProperties {
    router: Router;
    readonly graphWorker: WorkerConnection;
  }
}
