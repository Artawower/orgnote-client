export function isGpgEncrypted(text: string): boolean {
  return text.startsWith('-----BEGIN PGP MESSAGE-----');
}
