import { FileOpenerStore, getFileExtension } from 'orgnote-api';
import { defineStore } from 'pinia';
import { useCurrentNoteStore } from './current-note';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';
import { useNotifications } from 'src/hooks';
import { useI18n } from 'vue-i18n';

export const useFileOpenerStore = defineStore<string, FileOpenerStore>(
  'file-picker',
  (): FileOpenerStore => {
    const currentNoteStore = useCurrentNoteStore();
    const router = useRouter();
    const notifications = useNotifications();
    const { t } = useI18n();

    const openOrgFile = async (filePath: string[]): Promise<void> => {
      const note = await currentNoteStore.getByFilePath(filePath);
      router.push({
        name: RouteNames.RawEditor,
        params: { id: note.id },
      });
    };

    const fileOpeners: { [key: string]: (path: string[]) => Promise<void> } = {
      org: openOrgFile,
      gpg: openOrgFile,
    };

    const openFile = async (filePath: string[]): Promise<void> => {
      const fileExtension = getFileExtension(filePath.at(-1));
      const fileOpener = fileOpeners[fileExtension];
      if (!fileOpener) {
        // TODO: notification
        notifications.notify(
          fileExtension + ' ' + t('file opener is not supported yet')
        );
        return;
      }
      fileOpener(filePath);
    };

    return {
      openFile,
    };
  }
);
