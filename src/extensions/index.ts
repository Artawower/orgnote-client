import type { Extension, ExtensionMeta } from 'orgnote-api';
import { orgInlineMarkupManifest } from './org-inline-markup/manifest';
import { orgTableManifest } from './org-table/manifest';
import { orgSrcBlockManifest } from './org-src-block/manifest';

type ExtensionLoader = () => Promise<Extension>;

export const BUILTIN_LOADERS: Record<string, ExtensionLoader> = {
  [orgInlineMarkupManifest.name]: () =>
    import('./org-inline-markup').then((m) => m.orgInlineMarkupExtension),
  [orgTableManifest.name]: () => import('./org-table').then((m) => m.orgTableExtension),
  [orgSrcBlockManifest.name]: () =>
    import('./org-src-block').then((m) => m.orgSrcBlockExtension),
};

export const BUILTIN_META: ExtensionMeta[] = [
  { manifest: orgInlineMarkupManifest, active: true },
  { manifest: orgTableManifest, active: true },
  { manifest: orgSrcBlockManifest, active: true },
];
