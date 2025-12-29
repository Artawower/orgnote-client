import { defineStore } from 'pinia';
import { computed, reactive, ref, watch } from 'vue';
import { debounce } from 'src/utils/debounce';
import {
  isOrgGpgFile,
  i18n,
  type BufferStore,
  type Buffer as OrgBuffer,
  type BufferGuard,
  type FileSystemChange,
} from 'orgnote-api';
import {
  to,
  uint8ArrayToBase64,
  uint8ArrayToText,
  textToUint8Array,
} from 'orgnote-api/utils';
import { api } from 'src/boot/api';
import { reporter } from 'src/boot/report';
import type { ResultAsync } from 'neverthrow';
import { errAsync, okAsync } from 'neverthrow';
import { useFileGuardStore } from './file-guard';
import { useFileWatcherStore } from './file-watcher';
import { DEFAULT_SAVE_DELAY_MS, DEFAULT_VALIDATION_DELAY_MS } from 'src/constants/config';

const SAVE_IGNORE_WINDOW_MS = 300;

class EncryptionConfigRequiredError extends Error {
  constructor() {
    super('Encryption configuration is required to handle encrypted files.');
  }
}

const extractTitleFromPath = (path: string): string => path.split('/').pop() || 'Untitled';

const incrementBufferReference = (buffer: OrgBuffer): OrgBuffer => {
  buffer.referenceCount += 1;
  buffer.lastAccessed = new Date();
  return buffer;
};

const initValidationLastContent = (buffer: OrgBuffer): void => {
  if (!buffer.guard?.validation) {
    return;
  }
  buffer.guard.validation.lastValidContent = buffer.text;
};

const isRecentlySaved = (buffer: OrgBuffer): boolean => {
  const lastSavedAt = buffer.metadata.lastSavedAt as number | undefined;
  if (!lastSavedAt) {
    return false;
  }
  return Date.now() - lastSavedAt < SAVE_IGNORE_WINDOW_MS;
};

const shouldIgnoreExternalChange = (buffer: OrgBuffer): boolean =>
  buffer.isSaving || isRecentlySaved(buffer);

export const useBufferStore = defineStore<string, BufferStore>('buffers', (): BufferStore => {
  const buffers = ref<Map<string, OrgBuffer>>(new Map());
  const debouncedSavers = new Map<string, () => void>();
  const bufferUnwatchers = new Map<string, () => void>();

  const fm = api.core.useFileSystemManager();
  const encryption = api.core.useEncryption();
  const config = api.core.useConfig();

  const isEncryptionConfigValid = (): boolean => config.config.encryption.type !== 'disabled';

  const encryptContent = (
    filePath: string,
    content: Uint8Array,
  ): ResultAsync<Uint8Array, Error> => {
    if (!isOrgGpgFile(filePath)) {
      return okAsync(content);
    }
    if (!isEncryptionConfigValid()) {
      return errAsync(new EncryptionConfigRequiredError());
    }
    const text = uint8ArrayToText(content);
    return to(encryption.encrypt)(text).map(textToUint8Array);
  };

  const decryptContent = (
    filePath: string,
    content: Uint8Array,
  ): ResultAsync<Uint8Array, Error> => {
    if (!content.length || !isOrgGpgFile(filePath)) {
      return okAsync(content);
    }
    if (!isEncryptionConfigValid()) {
      return errAsync(new EncryptionConfigRequiredError());
    }
    const text = uint8ArrayToText(content);
    return to(encryption.decrypt)(text).map(textToUint8Array);
  };

  const writeBufferFile = async (buffer: OrgBuffer): Promise<boolean> => {
    if (!fm.currentFs) {
      reporter.reportError(new Error('No file system selected'));
      return false;
    }

    const contentToWrite = new Uint8Array(buffer.rawContent);
    const result = await encryptContent(buffer.path, contentToWrite)
      .andThen((content) => to(fm.currentFs!.writeFile)(buffer.path, content, 'binary'))
      .map(() => {
        buffer.metadata.originalRawContent = new Uint8Array(contentToWrite);
      });

    if (result.isErr()) {
      reporter.reportError(new Error(`Failed to save: ${buffer.path}`, { cause: result.error }));
      return false;
    }

    return true;
  };

  const readBufferFile = async (buffer: OrgBuffer): Promise<void> => {
    if (!fm.currentFs) {
      reporter.reportError(new Error('No file system selected'));
      return;
    }

    const safeRead = to(fm.currentFs.readFile, 'Failed to load buffer content');
    const result = await safeRead<'binary', Uint8Array>(buffer.path, 'binary')
      .andThen((content) => decryptContent(buffer.path, content))
      .map((content) => {
        buffer.rawContent = content;
        buffer.metadata.originalRawContent = new Uint8Array(content);
      });

    if (result.isErr()) {
      const errMsg = `Failed to load: ${buffer.path}`;
      reporter.reportError(new Error(errMsg, { cause: result.error }));
      buffer.errors.push(errMsg, result.error.message);
    }
  };

  const areUint8ArraysEqual = (a: Uint8Array, b: Uint8Array): boolean => {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  };

  const isBufferDirty = (buffer: OrgBuffer): boolean => {
    const original = buffer.metadata.originalRawContent as Uint8Array | undefined;
    const current = buffer.rawContent;

    if (original === undefined) {
      return current.length > 0;
    }

    return !areUint8ArraysEqual(current, original);
  };

  const saveBuffer = async (buffer: OrgBuffer): Promise<void> => {
    if (!isBufferDirty(buffer)) {
      return;
    }

    buffer.isSaving = true;
    const success = await writeBufferFile(buffer);

    if (success) {
      buffer.metadata.lastSavedAt = Date.now();
    }

    buffer.isSaving = false;
  };

  const loadBufferContent = async (buffer: OrgBuffer): Promise<void> => {
    buffer.isLoading = true;
    await readBufferFile(buffer);
    buffer.isLoading = false;
  };

  const getSaveDelayMs = (): number => config.config.editor.saveDelayMs ?? DEFAULT_SAVE_DELAY_MS;

  const getValidationDelayMs = (): number =>
    config.config.editor.validationDelayMs ?? DEFAULT_VALIDATION_DELAY_MS;

  const buildBufferGuard = (path: string): BufferGuard | undefined => {
    const fileGuardStore = useFileGuardStore();
    const isReadonly = fileGuardStore.isReadOnly(path);
    const hasValidator = !!fileGuardStore.getGuard(path)?.validator;

    if (!isReadonly && !hasValidator) {
      return undefined;
    }

    return {
      readonly: isReadonly,
      reason: fileGuardStore.getReadOnlyReason(path),
      validation: hasValidator
        ? { status: 'idle', errors: [], lastValidContent: undefined }
        : undefined,
    };
  };

  const createEmptyBuffer = (path: string): OrgBuffer => {
    const state = reactive({
      rawContent: new Uint8Array() as Uint8Array,
    });

    return reactive({
      path,
      title: extractTitleFromPath(path),
      get rawContent() {
        return state.rawContent;
      },
      set rawContent(value: Uint8Array) {
        state.rawContent = value;
      },
      get text() {
        return uint8ArrayToText(state.rawContent);
      },
      get base64() {
        return uint8ArrayToBase64(state.rawContent);
      },
      setText(value: string) {
        state.rawContent = textToUint8Array(value);
      },
      isSaving: false,
      errors: [],
      isLoading: true,
      lastAccessed: new Date(),
      referenceCount: 1,
      metadata: {},
      guard: buildBufferGuard(path),
    });
  };

  const validateBufferContent = (path: string, content: string) => {
    const fileGuardStore = useFileGuardStore();
    const safeValidate = to(
      fileGuardStore.validate.bind(fileGuardStore),
      `Validation failed for "${path}"`,
    );
    return safeValidate(path, content);
  };

  const formatValidationErrors = (errors: Array<{ message: string }>): string =>
    errors.map((e) => e.message).join('\n');

  const reportValidationErrors = (errors: Array<{ message: string }>): void => {
    const details = formatValidationErrors(errors);
    reporter.reportWarning(details);
  };

  const validateAndSaveBuffer = async (buffer: OrgBuffer): Promise<void> => {
    const validation = buffer.guard!.validation!;

    validation.status = 'validating';

    const result = await validateBufferContent(buffer.path, buffer.text);

    if (result.isErr()) {
      validation.status = 'invalid';
      validation.errors = [{ message: result.error.message, severity: 'error' }];
      reporter.reportError(result.error);
      return;
    }

    validation.errors = result.value;
    validation.status = result.value.length === 0 ? 'valid' : 'invalid';

    if (result.value.length > 0) {
      reportValidationErrors(result.value);
      return;
    }

    await saveBuffer(buffer);
    validation.lastValidContent = buffer.text;
  };

  const setupValidatedAutoSave = (buffer: OrgBuffer): void => {
    const debouncedValidateAndSave = debounce(
      () => validateAndSaveBuffer(buffer),
      getValidationDelayMs(),
    );
    watch(() => buffer.base64, debouncedValidateAndSave);
  };

  const setupRegularAutoSave = (buffer: OrgBuffer): void => {
    const debouncedSave = debounce(() => saveBuffer(buffer), getSaveDelayMs());
    debouncedSavers.set(buffer.path, debouncedSave);
    watch(
      () => buffer.base64,
      () => debouncedSavers.get(buffer.path)?.(),
    );
  };

  const setupAutoSave = (buffer: OrgBuffer): void => {
    if (buffer.guard?.readonly) {
      return;
    }

    if (buffer.guard?.validation) {
      setupValidatedAutoSave(buffer);
      return;
    }

    setupRegularAutoSave(buffer);
  };

  const handleExternalChange = async (
    buffer: OrgBuffer,
    change: FileSystemChange,
  ): Promise<void> => {
    if (shouldIgnoreExternalChange(buffer)) {
      return;
    }

    if (isBufferDirty(buffer)) {
      return;
    }

    if (change.type === 'delete') {
      buffer.errors.push(i18n.FILE_DELETED_EXTERNALLY);
      return;
    }

    await loadBufferContent(buffer);
  };

  const setupFileWatcher = (buffer: OrgBuffer): (() => void) => {
    const fileWatcher = useFileWatcherStore();
    return fileWatcher.watch(buffer.path, (change) => void handleExternalChange(buffer, change));
  };

  const allBuffers = computed(() => Array.from(buffers.value.values()));

  const getOrCreateBuffer = async (path: string): Promise<OrgBuffer> => {
    const existing = buffers.value.get(path);
    if (existing) {
      return incrementBufferReference(existing);
    }

    const buffer = createEmptyBuffer(path);
    buffers.value.set(path, buffer);

    await loadBufferContent(buffer);
    initValidationLastContent(buffer);
    setupAutoSave(buffer);

    const unwatch = setupFileWatcher(buffer);
    bufferUnwatchers.set(path, unwatch);

    return buffer;
  };

  const releaseBuffer = (path: string): void => {
    const buffer = buffers.value.get(path);
    if (!buffer) {
      return;
    }
    buffer.referenceCount = Math.max(0, buffer.referenceCount - 1);
  };

  const getBufferByPath = (path: string): OrgBuffer | undefined => buffers.value.get(path);

  const saveBufferByPath = async (path: string): Promise<void> => {
    const buffer = getBufferByPath(path);
    if (!buffer) {
      return;
    }
    await saveBuffer(buffer);
  };

  const closeBuffer = async (path: string, force = false): Promise<boolean> => {
    const buffer = getBufferByPath(path);
    if (!buffer) {
      return true;
    }
    if (isBufferDirty(buffer) && !force) {
      return false;
    }
    await saveBufferByPath(path);
    buffers.value.delete(path);
    debouncedSavers.delete(path);
    stopWatch(path);
    return true;
  };

  const stopWatch = (path: string): void => {
    bufferUnwatchers.get(path)?.();
    bufferUnwatchers.delete(path);
  };

  const saveAllBuffers = async (): Promise<void> => {
    await Promise.all(allBuffers.value.map(saveBuffer));
  };

  const cleanupUnusedBuffers = (): void => {
    allBuffers.value
      .filter((b) => b.referenceCount === 0)
      .forEach((b) => void closeBuffer(b.path, true));
  };

  const store: BufferStore = {
    buffers,
    allBuffers,
    getOrCreateBuffer,
    releaseBuffer,
    closeBuffer,
    getBufferByPath,
    saveAllBuffers,
    cleanup: cleanupUnusedBuffers,
  };

  return store;
});
