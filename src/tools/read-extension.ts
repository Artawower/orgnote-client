import {
  Extension,
  ExtensionManifest,
  StoredExtension,
} from 'src/api/extension';

export async function readExtension(file: File): Promise<StoredExtension> {
  const rawContent = encodeURIComponent(await file.text());
  console.log('✎: [line 5][read-extension.ts] rawContent: ', rawContent);

  const module = `data:text/javascript,${rawContent}`;

  const m = (await import(module)) as {
    default: Extension;
    manifest: ExtensionManifest;
  };
  // TODO: master vlaidate extension by provided manifest.
  console.log('✎: [line 10][read-extension.ts] m: ', m);

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
