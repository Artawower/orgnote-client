import { defineStore } from 'pinia';
import {
  ExtensionParsingError,
  type Extension,
  type ExtensionManifest,
  type ExtensionMeta,
  type ExtensionSource,
  type ExtensionSourceInfo,
  type ExtensionStore,
  type GitRepoHandle,
  type GitSource,
  type LocalSource,
} from 'orgnote-api';
import { ref, computed, type ComputedRef } from 'vue';
import { api } from 'src/boot/api';
import { extensionTimer } from 'src/boot/perf-timer';
import { compileExtension, parseExtensionFromFile } from 'src/utils/read-extension';
import { validateManifest } from 'src/utils/validate-manifest';
import { reporter } from 'src/boot/report';
import { to } from 'orgnote-api/utils';
import { useFileSystemStore } from './file-system';
import { parseToml, stringifyToml } from 'orgnote-api/utils';
import { useGitStore } from './git';
import { resetCSSVariables } from 'src/utils/css-utils';
import { THEME_VARIABLES } from 'orgnote-api';
import { useConfigStore } from './config';
import { Dark } from 'quasar';
import { ORGNOTE_EXTENSIONS_FILE_PATH } from 'src/constants/system-file-paths';
import { BUILTIN_LOADERS, BUILTIN_META } from 'src/extensions';

interface ActiveExtension extends ExtensionMeta {
  module: Extension;
}

interface ExtensionsFile {
  extensions: ExtensionMeta[];
}

interface FetchedExtension {
  manifest: ExtensionManifest;
  module: string;
  rawContent: string;
}

type SourceFetcher = (source: ExtensionSourceInfo) => Promise<FetchedExtension>;

const extensionsFilePath = ORGNOTE_EXTENSIONS_FILE_PATH;
const distFolder = 'dist';

const applyMissingDefaults = (
  stored: Record<string, unknown>,
  defaults: Record<string, unknown>,
): Record<string, unknown> => ({ ...defaults, ...stored });

export const useExtensionsStore = defineStore<'extension', ExtensionStore>('extension', () => {
  const extensions = ref<ExtensionMeta[]>([]);
  const activeExtensions = ref<ActiveExtension[]>([]);
  const fileSystem = useFileSystemStore();

  const loading = ref<number>(0);
  const ready = computed(() => loading.value <= 0);

  const safeParseToml = to(parseToml, (e) => new SyntaxError('Invalid TOML format', { cause: e }));
  const safeStringifyToml = to(
    stringifyToml,
    (e) => new Error('Failed to stringify TOML', { cause: e }),
  );

  const sync = async (): Promise<void> => {
    loading.value++;

    const runSync = to(
      () =>
        extensionTimer.measure('sync', async () => {
          await readFromDisk();
          registerBuiltinExtensions();
          await mountActiveExtensions();
        }),
      'Failed to sync extensions',
    );

    const result = await runSync();
    loading.value--;

    if (result.isErr()) {
      reporter.reportError(result.error);
    }
  };

  const registerBuiltinExtensions = (): void => {
    const newBuiltins = BUILTIN_META.filter(
      (meta) => !extensions.value.some((e) => e.manifest.name === meta.manifest.name),
    );
    extensions.value.push(...newBuiltins);
  };

  const writeToDisk = async (): Promise<void> => {
    const data: ExtensionsFile = { extensions: extensions.value };
    const safeWrite = to(fileSystem.writeFile, 'Failed to write extensions.toml');

    const res = safeStringifyToml(data).asyncAndThen((content) =>
      safeWrite(extensionsFilePath, content),
    );

    const result = await res;
    if (result.isErr()) {
      reporter.reportError(result.error);
    }
  };

  const readFromDisk = async (): Promise<void> => {
    const safeRead = to(fileSystem.readFile, 'Failed to read extensions.toml');

    const res = await safeRead(extensionsFilePath, 'utf8');

    if (res.isErr()) {
      return;
    }

    const content = res.value;
    if (!content) {
      return;
    }

    const parseResult = safeParseToml(content as string);
    if (parseResult.isErr()) {
      reporter.reportError(parseResult.error);
      return;
    }

    const data = parseResult.value as unknown as ExtensionsFile;
    extensions.value = data.extensions ?? [];
  };

  const mountActiveExtensions = async (): Promise<void> => {
    const activeExtensionsMeta = extensions.value.filter((meta) => meta.active);

    const mountPromises = activeExtensionsMeta.map((meta) => mountExtension(meta));

    await Promise.allSettled(mountPromises);
  };

  const compileFromRepository = async (name: string): Promise<Extension | undefined> => {
    const source = await api.infrastructure.extensionSourceRepository.get(name);
    if (!source) {
      return undefined;
    }

    const safeCompile = to(compileExtension, 'Failed to load extension');
    const compileResult = await safeCompile(source.module);

    if (compileResult.isErr()) {
      reporter.reportError(compileResult.error);
      return undefined;
    }

    return compileResult.value;
  };

  const getExtensionModule = (name: string): Promise<Extension | undefined> =>
    BUILTIN_LOADERS[name]?.() ?? compileFromRepository(name);

  const syncExtensionConfig = async (meta: ExtensionMeta, module: Extension): Promise<void> => {
    if (!module.defaultSettings) return;
    const merged = applyMissingDefaults(meta.config ?? {}, module.defaultSettings);
    if (JSON.stringify(merged) === JSON.stringify(meta.config ?? {})) return;
    meta.config = merged;
    await writeToDisk();
  };

  const callOnMounted = async (module: Extension, name: string): Promise<boolean> => {
    const safeMounted = to(module.onMounted.bind(module), `Failed to mount extension ${name}`);
    const result = await safeMounted(api);
    if (result.isErr()) {
      reporter.reportError(result.error);
      return false;
    }
    return true;
  };

  const mountExtension = async (meta: ExtensionMeta): Promise<ActiveExtension | undefined> =>
    extensionTimer.measure(`mount:${meta.manifest.name}`, async () => {
      const existing = activeExtensions.value.find((e) => e.manifest.name === meta.manifest.name);
      if (existing) return existing;

      const module = await getExtensionModule(meta.manifest.name);
      if (!module) return undefined;

      await syncExtensionConfig(meta, module);

      const mounted = await callOnMounted(module, meta.manifest.name);
      if (!mounted) return undefined;

      const activeExt: ActiveExtension = {
        manifest: meta.manifest,
        active: true,
        config: meta.config,
        module,
      };
      activeExtensions.value.push(activeExt);
      return activeExt;
    });

  const unmountExtension = async (extensionName: string): Promise<void> => {
    return extensionTimer.measure(`unmount:${extensionName}`, async () => {
      const ext = activeExtensions.value.find((e) => e.manifest.name === extensionName);
      if (!ext) {
        return;
      }

      if (ext.module?.onUnmounted) {
        const safeUnmount = to(
          ext.module.onUnmounted.bind(ext.module),
          'Failed to unmount extension',
        );
        const result = await safeUnmount(api);

        if (result.isErr()) {
          reporter.reportError(result.error);
        }
      }

      activeExtensions.value = activeExtensions.value.filter(
        (e) => e.manifest.name !== extensionName,
      );
    });
  };

  const isThemeExtension = (manifest: ExtensionManifest): boolean => {
    return (manifest.category ?? '').toLowerCase() === 'theme';
  };

  const disableOtherThemes = async (currentThemeName: string): Promise<void> => {
    const otherActiveThemes = extensions.value.filter(
      (e) => e.active && isThemeExtension(e.manifest) && e.manifest.name !== currentThemeName,
    );

    await Promise.allSettled(otherActiveThemes.map((t) => unmountExtension(t.manifest.name)));
    otherActiveThemes.forEach((t) => {
      t.active = false;
    });
  };

  const setConfigThemeName = (themeName: string | null): void => {
    const { config } = useConfigStore();
    if (Dark.isActive) {
      config.ui.darkThemeName = themeName;
      return;
    }
    config.ui.lightThemeName = themeName;
  };

  const handleThemeActivation = async (extensionName: string): Promise<void> => {
    await disableOtherThemes(extensionName);
    resetCSSVariables([...THEME_VARIABLES]);
    setConfigThemeName(extensionName);
  };

  const handleThemeDeactivation = (extensionName: string): void => {
    const { config } = useConfigStore();
    const isCurrentDarkTheme = Dark.isActive && config.ui.darkThemeName === extensionName;
    const isCurrentLightTheme = !Dark.isActive && config.ui.lightThemeName === extensionName;
    if (!isCurrentDarkTheme && !isCurrentLightTheme) {
      return;
    }
    resetCSSVariables([...THEME_VARIABLES]);
    setConfigThemeName(null);
  };

  const enableExtension = async (extensionName: string): Promise<void> => {
    const meta = extensions.value.find((e) => e.manifest.name === extensionName);
    if (!meta) {
      reporter.reportWarning(`Extension ${extensionName} not found`);
      return;
    }

    if (meta.active) {
      return;
    }

    if (isThemeExtension(meta.manifest)) {
      await handleThemeActivation(extensionName);
    }

    await mountExtension(meta);
    meta.active = true;
    await writeToDisk();
  };

  const disableExtension = async (extensionName: string): Promise<void> => {
    const meta = extensions.value.find((e) => e.manifest.name === extensionName);
    if (!meta) {
      reporter.reportWarning(`Extension ${extensionName} not found`);
      return;
    }

    if (isThemeExtension(meta.manifest)) {
      handleThemeDeactivation(extensionName);
    }

    await unmountExtension(extensionName);
    meta.active = false;
    await writeToDisk();
  };

  const isExtensionExist = (extensionName: string): boolean =>
    extensions.value.some((e) => e.manifest.name === extensionName);

  const addExtension = async (meta: ExtensionMeta, source: ExtensionSource): Promise<void> => {
    extensions.value = extensions.value.filter((e) => e.manifest.name !== meta.manifest.name);
    extensions.value.push(meta);

    const safeUpsert = to(
      api.infrastructure.extensionSourceRepository.upsert,
      'Failed to save extension source',
    );
    const upsertResult = await safeUpsert(source);

    if (upsertResult.isErr()) {
      reporter.reportError(upsertResult.error);
      return;
    }

    await writeToDisk();

    if (meta.active) {
      await enableExtension(meta.manifest.name);
    }
  };

  const resolveExtensionPaths = async (
    repoHandle: GitRepoHandle,
  ): Promise<{ entryPath: string; manifestPath: string }> => {
    const hasDist = await repoHandle.fileExists(distFolder);
    const baseDir = hasDist ? `${distFolder}/` : '';
    return {
      entryPath: `${baseDir}index.js`,
      manifestPath: `${baseDir}manifest.json`,
    };
  };

  const extractManifestFromModule = async (moduleContent: string): Promise<ExtensionManifest> => {
    const encodedModule = encodeURIComponent(moduleContent);
    const moduleUrl = `data:text/javascript,${encodedModule}`;
    const m = (await import(/* @vite-ignore */ moduleUrl)) as {
      manifest?: ExtensionManifest;
    };

    if (!m.manifest) {
      throw new Error('Extension manifest not found in module exports');
    }

    return m.manifest;
  };

  const parseManifestJson = (content: string): ExtensionManifest => JSON.parse(content);

  const resolveManifest = async (
    repoHandle: GitRepoHandle,
    manifestPath: string,
    moduleContent: string,
  ): Promise<ExtensionManifest> => {
    const hasManifest = await repoHandle.fileExists(manifestPath);

    if (!hasManifest) {
      const manifest = await extractManifestFromModule(moduleContent);
      validateManifest(manifest);
      return manifest;
    }

    const content = await repoHandle.readFile(manifestPath, 'utf8');
    const safeParse = to(parseManifestJson, `Invalid manifest JSON in ${manifestPath}`);
    const parseResult = safeParse(content);

    if (parseResult.isErr()) {
      throw parseResult.error;
    }

    validateManifest(parseResult.value);
    return parseResult.value;
  };

  const fetchFromGit = async (source: GitSource): Promise<FetchedExtension> => {
    const gitStore = useGitStore();
    const repoHandle = await gitStore.openRepo({
      url: source.repo,
      branch: source.branch ?? source.tag,
    });

    const paths = await resolveExtensionPaths(repoHandle);
    const moduleContent = await repoHandle.readFile(paths.entryPath, 'utf8');
    const manifest = await resolveManifest(repoHandle, paths.manifestPath, moduleContent);
    manifest.source = source;

    return {
      manifest,
      module: encodeURIComponent(moduleContent),
      rawContent: moduleContent,
    };
  };

  const sourceFetchers: Record<ExtensionSourceInfo['type'], SourceFetcher> = {
    git: (source) => fetchFromGit(source as GitSource),
    local: () => {
      throw new Error('Local extensions cannot be installed via installExtension');
    },
    builtin: () => {
      throw new Error('Builtin extensions cannot be installed via installExtension');
    },
  };

  const installExtension = async (source: ExtensionSourceInfo): Promise<void> => {
    const fetcher = sourceFetchers[source.type];

    const safeFetch = to(fetcher, 'Failed to fetch extension');
    const fetchResult = await safeFetch(source);

    if (fetchResult.isErr()) {
      reporter.reportError(fetchResult.error);
      return;
    }

    const fetched = fetchResult.value;

    const meta: ExtensionMeta = {
      manifest: fetched.manifest,
      active: true,
    };

    const extensionSource: ExtensionSource = {
      name: fetched.manifest.name,
      version: fetched.manifest.version,
      source: source.type === 'git' ? (source as GitSource).repo : 'local',
      module: fetched.module,
      docFiles: [],
    };

    await addExtension(meta, extensionSource);
  };

  const deleteExtension = async (extensionName: string): Promise<void> => {
    await unmountExtension(extensionName);

    const safeDelete = to(
      api.infrastructure.extensionSourceRepository.delete,
      'Failed to delete extension source',
    );
    const deleteResult = await safeDelete(extensionName);

    if (deleteResult.isErr()) {
      reporter.reportError(deleteResult.error);
    }

    extensions.value = extensions.value.filter((e) => e.manifest.name !== extensionName);
    await writeToDisk();
  };

  const importExtension = async (file: File): Promise<void> => {
    const safeParse = to(parseExtensionFromFile, (e: unknown) => {
      const error = e instanceof Error ? e : new Error(String(e));
      return new ExtensionParsingError(file.name, { cause: error });
    });
    const parseResult = await safeParse(file);

    if (parseResult.isErr()) {
      reporter.reportError(parseResult.error);
      return;
    }

    const { manifest, rawContent } = parseResult.value;

    const localSource: LocalSource = { type: 'local' };
    manifest.source = localSource;
    manifest.development = true;

    const meta: ExtensionMeta = {
      manifest,
      active: true,
      uploaded: true,
    };

    const extensionSource: ExtensionSource = {
      name: manifest.name,
      version: manifest.version,
      source: 'local',
      module: rawContent,
      docFiles: [],
    };

    await addExtension(meta, extensionSource);
  };

  const enableSafeMode = async (): Promise<void> => {
    const nonLocalExtensions = activeExtensions.value.filter(
      (ext) => ext.manifest.source.type !== 'local',
    );

    const unmountPromises = nonLocalExtensions.map((ext) => unmountExtension(ext.manifest.name));
    await Promise.allSettled(unmountPromises);
  };

  const disableSafeMode = async (): Promise<void> => {
    const activeExtensionsMeta = extensions.value.filter((meta) => meta.active);
    const mountPromises = activeExtensionsMeta.map((meta) => mountExtension(meta));
    await Promise.allSettled(mountPromises);
  };

  const getExtensionConfig = (name: string): ComputedRef<Readonly<Record<string, unknown>>> =>
    computed(() => {
      const ext = extensions.value.find((e) => e.manifest.name === name);
      return (ext?.config ?? {}) as Readonly<Record<string, unknown>>;
    });

  const setExtensionConfig = async (
    name: string,
    config: Record<string, unknown>,
  ): Promise<void> => {
    const ext = extensions.value.find((e) => e.manifest.name === name);
    if (!ext) return;
    ext.config = config;
    await writeToDisk();
  };

  const hasExtensionSettings = (name: string): boolean =>
    !!activeExtensions.value.find((e) => e.manifest.name === name)?.module?.settingsSchema;

  const getActiveExtensionModule = (name: string): Extension | undefined =>
    activeExtensions.value.find((e) => e.manifest.name === name)?.module;

  const store: ExtensionStore = {
    extensions,
    ready,

    sync,
    enableExtension,
    disableExtension,
    isExtensionExist,
    addExtension,
    installExtension,
    importExtension,
    deleteExtension,
    enableSafeMode,
    disableSafeMode,
    getExtensionConfig,
    setExtensionConfig,
    hasExtensionSettings,
    getActiveExtensionModule,
  };

  return store;
});
