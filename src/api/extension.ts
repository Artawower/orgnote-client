import { OrgNoteApi } from './api';

export interface ExtensionManifest {
  /* Should be unique in the extension repo */
  name: string;
  version: string;
  category: 'theme' | 'extension' | 'language pack' | 'other';
  /* OrgNote api semver, 0.13.4 for example */
  apiVersion: string;
  author?: string;
  description?: string;
  keywords?: string[];
  repo: string;
  /* Default value is README.org */
  readmeFilePath?: string;
  /* WIP */
  permissions?: Array<'files' | 'personal info' | '*' | 'third party'>;
  reloadRequired?: boolean;
  /* WIP */
  git?: string;
  sponsor?: string[];
  development?: boolean;
  icon?: string;
}

export interface Extension {
  [key: string]: unknown;

  onMounted: (api: OrgNoteApi) => Promise<void>;
  onUnmounted?: (api: OrgNoteApi) => Promise<void>;
}

export interface ExtensionMeta {
  manifest: ExtensionManifest;
  active?: boolean;
}

export interface StoredExtension extends ExtensionMeta {
  module: string;
}

export interface ActiveExtension extends ExtensionMeta {
  module: Extension;
}
