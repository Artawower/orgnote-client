export function searchObject<T>(
  searchQuery?: string,
  ...targetKeys: (keyof T)[]
): (obj: { [key in keyof T]: string }) => boolean {
  return (obj: { [key in keyof T]: string }) => {
    return searchFilter(searchQuery, ...targetKeys.map((t) => obj[t]));
  };
}

export function searchFilter(
  searchQuery?: string,
  ...target: string[]
): boolean {
  if (!searchQuery?.length || !target?.length) {
    return true;
  }
  return target.some((s) =>
    s.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );
}
