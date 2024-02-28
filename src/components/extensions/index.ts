import {
  tableExtension,
  tableExtensionManifest,
} from './org-editor-table.extension';
import {
  latexBlockExtension,
  latexBlockExtensionManifest,
} from './org-latex-block.extension';
import { imageExtension, imageExtensionManifest } from './org-image.extension';
import {
  htmlBlockExtension,
  htmlBlockExtensionManifest,
} from './org-html-block.extension';
import {
  propertyDrawerExtension,
  propertyDrawerExtensionManifest,
} from './org-property-drawer.extension';
import {
  quoteBlockExtension,
  quoteBlockExtensionManifest,
} from './org-quote-block.extension';
import {
  srcBlockExtension,
  srcBlockExtensionManifest,
} from './org-src-block.extension';
import {
  commonInlineMarkupExtension,
  commonInlineMarkupExtensionManifest,
} from './org-inline-markup.extension';
import {
  autocompleteExtension,
  autocompleteExtensionManifest,
} from './org-auto-insert.extension';
import {
  foldingExtension,
  foldingExtensionManifest,
} from './org-code-folding.extension';
import { Extension, ExtensionManifest } from 'orgnote-api';

const registerActiveExtension = (
  manifest: ExtensionManifest,
  ext: Extension
) => ({
  [manifest.name]: {
    manifest,
    module: ext,
    active: true,
  },
});

export const BUILTIN_EXTENSIONS = {
  ...registerActiveExtension(tableExtensionManifest, tableExtension),
  ...registerActiveExtension(latexBlockExtensionManifest, latexBlockExtension),
  ...registerActiveExtension(imageExtensionManifest, imageExtension),
  ...registerActiveExtension(htmlBlockExtensionManifest, htmlBlockExtension),
  ...registerActiveExtension(
    propertyDrawerExtensionManifest,
    propertyDrawerExtension
  ),
  ...registerActiveExtension(quoteBlockExtensionManifest, quoteBlockExtension),
  ...registerActiveExtension(srcBlockExtensionManifest, srcBlockExtension),
  ...registerActiveExtension(
    commonInlineMarkupExtensionManifest,
    commonInlineMarkupExtension
  ),
  ...registerActiveExtension(
    autocompleteExtensionManifest,
    autocompleteExtension
  ),
  ...registerActiveExtension(foldingExtensionManifest, foldingExtension),
} as const;
