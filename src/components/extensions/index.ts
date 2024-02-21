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

export const BUILTIN_EXTENSIONS = {
  [tableExtensionManifest.name]: {
    manifest: tableExtensionManifest,
    module: tableExtension,
    active: true,
  },
  [latexBlockExtensionManifest.name]: {
    manifest: latexBlockExtensionManifest,
    module: latexBlockExtension,
    active: true,
  },
  [imageExtensionManifest.name]: {
    manifest: imageExtensionManifest,
    module: imageExtension,
    active: true,
  },
  [htmlBlockExtensionManifest.name]: {
    manifest: htmlBlockExtensionManifest,
    module: htmlBlockExtension,
    active: true,
  },
  [propertyDrawerExtensionManifest.name]: {
    manifest: propertyDrawerExtensionManifest,
    module: propertyDrawerExtension,
    active: true,
  },
  [quoteBlockExtensionManifest.name]: {
    manifest: quoteBlockExtensionManifest,
    module: quoteBlockExtension,
    active: true,
  },
  [srcBlockExtensionManifest.name]: {
    manifest: srcBlockExtensionManifest,
    module: srcBlockExtension,
    active: true,
  },
} as const;
