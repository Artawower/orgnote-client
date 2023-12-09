import { OrgNoteApi } from './api';

export interface OrgNoteExtension {
  [key: string]: unknown;

  onBeforeMount?: (api: OrgNoteApi) => void;
  onMounted: (api: OrgNoteApi) => void;
  onBeforeUnmount?: (api: OrgNoteApi) => void;
  onUnmounted?: (api: OrgNoteApi) => void;
}
