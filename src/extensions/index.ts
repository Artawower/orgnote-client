import type { ExtensionManifest, Extension, ActiveExtension } from 'orgnote-api';

// TODO: feat/stable-beta delete
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const registerActiveExtension = (manifest: ExtensionManifest, ext: Extension) => ({
  [manifest.name]: {
    manifest,
    module: ext,
    active: true,
  },
});

export const BUILTIN_EXTENSIONS: { [key: string]: ActiveExtension } = {};
