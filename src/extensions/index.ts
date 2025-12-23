import type { Extension, ExtensionMeta } from 'orgnote-api';
import { orgInlineMarkupManifest } from './org-inline-markup';

type ExtensionLoader = () => Promise<Extension>;

export const BUILTIN_LOADERS: Record<string, ExtensionLoader> = {
  [orgInlineMarkupManifest.name]: () =>
    import('./org-inline-markup').then((m) => m.orgInlineMarkupExtension),
};

export const BUILTIN_META: ExtensionMeta[] = [
  { manifest: orgInlineMarkupManifest, active: true },
];
