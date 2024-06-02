export function withDomain(path: string): string {
  return (
    (process.env.CLIENT ? window.location.origin : process.env.DOMAIN) + path
  );
}
