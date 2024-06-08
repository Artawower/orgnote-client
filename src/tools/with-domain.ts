export function withDomain(path: string = ''): string {
  if (!path.startsWith('/')) {
    path = `/${path}`;
  }
  return (
    (process.env.CLIENT ? window.location.origin : process.env.DOMAIN ?? '') +
    path
  );
}
