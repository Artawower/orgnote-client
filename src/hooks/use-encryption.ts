import { useSettingsStore } from 'src/stores/settings';
import {
  createMessage,
  encrypt as gpgEncrypt,
  decrypt as gpgDecrypt,
  readKey,
  decryptKey,
  readPrivateKey,
  readMessage,
} from 'openpgp';

export class IncorrectOrMissingPrivateKeyPasswordError extends Error {}
export class ImpossibleToDecryptWithProvidedKeysError extends Error {}
export class IncorrectEncryptionPasswordError extends Error {}

const noPrivateKeyPassphraseProvidedErrorMsg =
  'Error: Signing key is not decrypted.';
const incorrectPrivateKeyPassphraseErrorMsg =
  'Error decrypting private key: Incorrect key passphrase';
const decryptionKeyIsNotDecryptedErrorMsg =
  'Error decrypting message: Decryption key is not decrypted.';
const corruptedPrivateKeyErrorMsg = 'Misformed armored text';

const decriptionFailedErrorMsg =
  'Error decrypting message: Session key decryption failed.';
const incorrectEncryptionPasswordErrorMsg =
  'Error decrypting message: Modification detected.';

export function useEncryption() {
  const { config } = useSettingsStore();

  const encrypt = async (text: string): Promise<string> => {
    if (config.encryption.type === 'gpg') {
      return await withCustomErrors(encryptViaKeys)(
        text,
        config.encryption.publicKey,
        config.encryption.privateKey,
        config.encryption.privateKeyPassphrase
      );
    }
    if (config.encryption.type === 'password') {
      return await withCustomErrors(encryptViaPassword)(
        text,
        config.encryption.password
      );
    }
    return text;
  };

  const decrypt = async (data: string): Promise<string> => {
    if (config.encryption.type === 'gpg') {
      return await withCustomErrors(decryptViaKeys)(
        data,
        config.encryption.privateKey,
        config.encryption.privateKeyPassphrase
      );
    }
    if (config.encryption.type === 'password') {
      return await withCustomErrors(decryptViaPassword)(
        data,
        config.encryption.password
      );
    }
    return data;
  };

  const withCustomErrors = <P extends unknown[], T>(
    fn: (...args: P) => Promise<T | never>
  ) => {
    return async (...args: P): Promise<T> => {
      try {
        return await fn(...args);
      } catch (e: unknown) {
        if (!(e instanceof Error)) {
          throw e;
        }
        if (
          [
            noPrivateKeyPassphraseProvidedErrorMsg,
            incorrectPrivateKeyPassphraseErrorMsg,
            corruptedPrivateKeyErrorMsg,
            decryptionKeyIsNotDecryptedErrorMsg,
          ].includes(e.message)
        ) {
          throw new IncorrectOrMissingPrivateKeyPasswordError(e.message);
        }
        if (e.message === decriptionFailedErrorMsg) {
          throw new ImpossibleToDecryptWithProvidedKeysError(e.message);
        }
        if (e.message === incorrectEncryptionPasswordErrorMsg) {
          throw new IncorrectEncryptionPasswordError();
        }
        throw e;
      }
    };
  };

  const encryptViaPassword = async (
    text: string,
    password: string
  ): Promise<string> => {
    const message = await createMessage({
      text,
    });

    const encryptedMessage = await gpgEncrypt({
      message,
      format: 'armored',
      passwords: [password],
    });

    return encryptedMessage.toString();
  };

  const encryptViaKeys = async (
    text: string,
    armoredPublicKey: string,
    armoredPrivateKey: string,
    privateKeyPassword?: string
  ): Promise<string> => {
    const publicKey = await readKey({ armoredKey: armoredPublicKey });

    const message = await createMessage({
      text,
    });

    const encryptedPrivateKey = await readPrivateKey({
      armoredKey: armoredPrivateKey,
    });

    const privateKey = privateKeyPassword
      ? await decryptKey({
          privateKey: encryptedPrivateKey,
          passphrase: privateKeyPassword,
        })
      : encryptedPrivateKey;

    const encryptedMessage = await gpgEncrypt({
      message,
      format: 'armored',
      encryptionKeys: publicKey,
      signingKeys: privateKey,
    });

    return encryptedMessage.toString();
  };

  const decryptViaPassword = async (
    data: string,
    password: string
  ): Promise<string> => {
    const message = await readMessage({ armoredMessage: data });

    const { data: decryptedText } = await gpgDecrypt({
      message,
      passwords: password,
    });

    return decryptedText.toString();
  };

  const decryptViaKeys = async (
    data: string,
    armoredPrivateKey: string,
    privateKeyPassword?: string
  ): Promise<string> => {
    const encryptedPrivateKey = await readPrivateKey({
      armoredKey: armoredPrivateKey,
    });

    const privateKey = privateKeyPassword
      ? await decryptKey({
          privateKey: encryptedPrivateKey,
          passphrase: privateKeyPassword,
        })
      : encryptedPrivateKey;

    const message = await readMessage({ armoredMessage: data });

    const { data: decryptedText } = await gpgDecrypt({
      message,
      decryptionKeys: privateKey,
    });

    return decryptedText.toString();
  };

  return {
    encrypt,
    decrypt,
  };
}
