import type { ExtensionManifest } from 'orgnote-api';

export const orgKeywordOverlayManifest: ExtensionManifest = {
  name: 'Keyword Overlay',
  version: '1.0.0',
  category: 'extension',
  source: { type: 'builtin' },
  description: 'Shows placeholders for empty keywords like #+TITLE:, #+AUTHOR:, etc.',
  author: 'OrgNote',
  keywords: ['keyword', 'placeholder', 'overlay', 'title'],
};
