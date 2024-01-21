import {
  Extension,
  ExtensionManifest,
  StoredExtension,
} from 'src/api/extension';

export async function readExtension(file: File): Promise<StoredExtension> {
  return await readExtensionFromString(await file.text());
}

export async function readExtensionFromString(
  rawExt: string
): Promise<StoredExtension> {
  const rawContent = encodeURIComponent(rawExt);

  const module = `data:text/javascript,${rawContent}`;

  const m = (await import(module)) as {
    default: Extension;
    manifest: ExtensionManifest;
  };

  // TODO: master vlaidate extension by provided manifest.
  return {
    manifest: {
      ...m.manifest,
      development: true,
    },
    active: false,
    module: rawContent,
  };
}

export async function importExtension(content: string): Promise<Extension> {
  const module = `data:text/javascript,${content}`;

  const m = (await import(module)) as {
    default: Extension;
    manifest: ExtensionManifest;
  };

  return m.default;
}
