/*
 * Extract search info from provided search text.
 * Return new search text and search tags.
 */
export function exctractSearchInfo(searchText: string): {
  searchQuery?: string;
  tags?: string[];
  scope?: string; // Any string that starts with @
} {
  const tagRegexpExtractor = /#[^ ]+/g;
  const tags =
    searchText.match(tagRegexpExtractor)?.map((t) => t.slice(1)) ?? [];

  const scopeRegexpExtractor = /^@[^ ]+/g;

  const scope = searchText.match(scopeRegexpExtractor)?.[0];

  const searchQuery = searchText
    .replace(scopeRegexpExtractor, '')
    .replace(tagRegexpExtractor, '')
    .replaceAll('#', '')
    .trim();
  return { searchQuery, tags, scope };
}
