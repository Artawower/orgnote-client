import EncryptionPrivateKeyPasswordPrompt from 'src/components/containers/EncryptionPrivateKeyPasswordPrompt.vue';
import { useNotifications } from './notification';
import {
  ImpossibleToDecryptWithProvidedKeysError,
  IncorrectEncryptionPasswordError,
  IncorrectOrMissingPrivateKeyPasswordError,
  NoKeysProvidedError,
  NoPasswordProvidedError,
} from 'orgnote-api/encryption';
import { useModalStore } from 'src/stores/modal';
import { useRouter } from 'vue-router';
import { RouteNames } from 'src/router/routes';

export function useEncryptionErrorHandler() {
  const modalStore = useModalStore();
  const notifications = useNotifications();
  const router = useRouter();

  const openModalForChangeEncryptionPassword = () =>
    modalStore.open(EncryptionPrivateKeyPasswordPrompt, {
      title: 'Missing or incorrect encryption password',
    });

  const openEcnryptionSettingsForChangingKeys = () => {
    router.push({ name: RouteNames.EncryptionSettings });
  };

  const handleError = (e: unknown): boolean => {
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
      openEcnryptionSettingsForChangingKeys();
      notifications.notify(
        'impossible to decrypt with provided keys',
        true,
        'error'
      );
      return true;
    }

    if (e instanceof IncorrectEncryptionPasswordError) {
      openModalForChangeEncryptionPassword();
      notifications.notify('incorrect encryption password', true, 'error');
      return true;
    }

    if (
      e instanceof NoPasswordProvidedError ||
      e instanceof NoKeysProvidedError
    ) {
      openEcnryptionSettingsForChangingKeys();
      notifications.notify('incorrect encryption method', true, 'error');
      return true;
    }
  };

  return {
    handleError,
  };
}
