import type { ExtensionManifest } from 'orgnote-api';

export const orgKeywordOverlayManifest: ExtensionManifest = {
  name: 'Keyword Overlay',
  version: '1.0.0',
  category: 'extension',
  source: { type: 'builtin' },
  description: 'Inline editors for #+TITLE: and #+DESCRIPTION: keywords.',
  author: 'OrgNote',
  keywords: ['keyword', 'placeholder', 'overlay', 'title'],
};
