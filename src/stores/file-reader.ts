import { I18N, type FileReaderStore } from 'orgnote-api';
import { defineStore } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useNotificationsStore } from './notifications';

export const useFileReaderStore = defineStore<string, FileReaderStore>(
  'file-reader',
  (): FileReaderStore => {
    const readers = new Map<string, (path: string) => Promise<void>>();
    const notifications = useNotificationsStore();

    const { t } = useI18n({
      useScope: 'global',
      inheritLocale: true,
    });

    /**
     * Adds a reader function for a specific file pattern
     * @param readerMatch - The pattern to match against file paths
     * @param reader - The reader function that handles the file
     */
    const addReader = (readerMatch: string, reader: (path: string) => Promise<void>): void => {
      readers.set(readerMatch, reader);
    };

    /**
     * Opens a file using the appropriate reader based on the file path
     * @param path - Array of path segments to the file
     */
    const openFile = async (path: string): Promise<void> => {
      const reader = Object.keys(readers).find((pattern) => new RegExp(pattern).test(path));

      if (!reader) {
        notifications.notify({
          message: `${t(I18N.NO_FILE_READER_FOR)} ${path}`,
          level: 'warning',
        });
        return;
      }

      console.log('[line 31]: open path', path);
    };

    return {
      addReader,
      openFile,
    };
  },
);
