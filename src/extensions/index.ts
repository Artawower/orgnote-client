import type { Extension, ExtensionMeta } from 'orgnote-api';
import { orgInlineMarkupManifest } from './org-inline-markup/manifest';
import { orgTableManifest } from './org-table/manifest';
import { orgSrcBlockManifest } from './org-src-block/manifest';
import { orgQuoteBlockManifest } from './org-quote-block/manifest';
import { orgLatexBlockManifest } from './org-latex-block/manifest';

type ExtensionLoader = () => Promise<Extension>;

export const BUILTIN_LOADERS: Record<string, ExtensionLoader> = {
  [orgInlineMarkupManifest.name]: () =>
    import('./org-inline-markup').then((m) => m.orgInlineMarkupExtension),
  [orgTableManifest.name]: () => import('./org-table').then((m) => m.orgTableExtension),
  [orgSrcBlockManifest.name]: () =>
    import('./org-src-block').then((m) => m.orgSrcBlockExtension),
  [orgQuoteBlockManifest.name]: () =>
    import('./org-quote-block').then((m) => m.orgQuoteBlockExtension),
  [orgLatexBlockManifest.name]: () =>
    import('./org-latex-block').then((m) => m.orgLatexBlockExtension),
};

export const BUILTIN_META: ExtensionMeta[] = [
  { manifest: orgInlineMarkupManifest, active: true },
  { manifest: orgTableManifest, active: true },
  { manifest: orgSrcBlockManifest, active: true },
  { manifest: orgQuoteBlockManifest, active: true },
  { manifest: orgLatexBlockManifest, active: true },
];
