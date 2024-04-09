import { generateKey } from 'openpgp';

export async function generateGpgKeys(params?: {
  username: string;
  email: string;
  passphrase?: string;
}): Promise<{
  privateKey: string;
  publicKey: string;
}> {
  const { privateKey, publicKey } = await generateKey({
    type: 'ecc',
    curve: 'curve25519',
    userIDs: [{ name: params.username, email: params.email }], // you can pass multiple user IDs
    passphrase: params.passphrase,
    format: 'armored',
  });

  return {
    privateKey,
    publicKey,
  };
}
