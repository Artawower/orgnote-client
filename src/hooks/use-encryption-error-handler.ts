import { useModalStore } from 'src/stores';
import {
  ImpossibleToDecryptWithProvidedKeysError,
  IncorrectOrMissingPrivateKeyPasswordError,
} from './use-encryption';
import EncryptionPrivateKeyPasswordPrompt from 'src/components/containers/EncryptionPrivateKeyPasswordPrompt.vue';
import { useNotifications } from './notification';
import SettingsPage from 'src/pages/SettingsPage.vue';

export function useEncryptionErrorHandler() {
  const modalStore = useModalStore();
  const notifications = useNotifications();

  const openModalForChangeEncryptionPassword = () =>
    modalStore.open(EncryptionPrivateKeyPasswordPrompt, {
      title: 'Missing or incorrect encryption password',
    });

  const openModalForChangEncryptionKeys = () => {
    // TODO: open from orgnote api
    modalStore.open(SettingsPage, { title: 'settings' });
  };

  const handleError = (e: Error): boolean => {
    if (e instanceof IncorrectOrMissingPrivateKeyPasswordError) {
      openModalForChangeEncryptionPassword();
      notifications.notify(
        'missing or incorrect encryption password',
        true,
        'error'
      );
      return true;
    }

    if (e instanceof ImpossibleToDecryptWithProvidedKeysError) {
      openModalForChangEncryptionKeys();
      notifications.notify(
        'impossible to decrypt with provided keys',
        true,
        'error'
      );
      return true;
    }
  };

  return {
    handleError,
  };
}
