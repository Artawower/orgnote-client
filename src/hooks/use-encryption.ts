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

export function useEncryption() {
  const { config } = useSettingsStore();

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

  const encrypt = async (text: string): Promise<string> => {
    if (config.encryption.type === 'disabled') {
      return text;
    }
    if (config.encryption.type === 'gpg') {
      return encryptViaKeys(
        text,
        config.encryption.publicKey,
        config.encryption.privateKey
      );
    }
    throw new Error(`Unsupported encryption method: ${config.encryption.type}`);
  };

  const decrypt = async (data: string): Promise<string> => {
    if (config.encryption.type === 'disabled') {
      return data;
    }
    if (config.encryption.type === 'gpg') {
      return decryptViaKeys(
        data,
        config.encryption.privateKey,
        config.encryption.privateKeyPassphrase
      );
    }
    throw new Error(`Unsupported encryption method: ${config.encryption.type}`);
  };

  return {
    encrypt,
    decrypt,
  };
}
