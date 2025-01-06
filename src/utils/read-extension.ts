import {
  type StoredExtension,
  type ExtensionManifest,
  type Extension,
  EXTENSION_MANIFEST_SCHEMA,
} from 'orgnote-api';
import { parse } from 'valibot';
import { formatValidationErrors } from './format-validation-errors';

export async function readExtension(file: File): Promise<StoredExtension> {
  return await readExtensionFromString(await file.text());
}

export async function readExtensionFromString(rawExt: string): Promise<StoredExtension> {
  const rawContent = encodeURIComponent(rawExt);

  const module = `data:text/javascript,${rawContent}`;

  const m = (await import(/* @vite-ignore */ module)) as {
    default: Extension;
    manifest: ExtensionManifest;
  };

  validateManifest(m.manifest);
  return {
    manifest: {
      ...m.manifest,
      development: true,
    },
    active: false,
    module: rawContent,
  };
}

export async function compileExtension(content: string): Promise<Extension> {
  const module = `data:text/javascript,${content}`;

  const m = (await import(/* @vite-ignore */ module)) as {
    default: Extension;
    manifest: ExtensionManifest;
  };

  validateManifest(m.manifest);

  return m.default;
}

function validateManifest(manifest: ExtensionManifest): void {
  try {
    parse(EXTENSION_MANIFEST_SCHEMA, manifest);
  } catch (e) {
    const errorMsg = formatValidationErrors(e as Error);
    throw new Error(errorMsg.join('\n'), { cause: e });
  }
}
