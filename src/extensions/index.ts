import type { Extension, ExtensionMeta } from 'orgnote-api';
import { orgInlineMarkupManifest } from './org-inline-markup/manifest';
import { orgTableManifest } from './org-table/manifest';

type ExtensionLoader = () => Promise<Extension>;

export const BUILTIN_LOADERS: Record<string, ExtensionLoader> = {
  [orgInlineMarkupManifest.name]: () =>
    import('./org-inline-markup').then((m) => m.orgInlineMarkupExtension),
  [orgTableManifest.name]: () =>
    import('./org-table').then((m) => m.orgTableExtension),
};

export const BUILTIN_META: ExtensionMeta[] = [
  { manifest: orgInlineMarkupManifest, active: true },
  { manifest: orgTableManifest, active: true },
];
