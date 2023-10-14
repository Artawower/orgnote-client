/*
 * Extract search info from provided search text.
 * Return new search text and search tags.
 *
 * @param searchText - search text.
 * @returns [string, string[]] - new search text and search tags.
 */
export function exctractSearchInfo(searchText: string): [string, string[]] {
  const tagRegexpExtractor = /#[^ ]+/g;
  const tags =
    searchText.match(tagRegexpExtractor)?.map((t) => t.slice(1)) ?? [];
  const searchString = searchText
    .replace(tagRegexpExtractor, '')
    .replaceAll('#', '')
    .trim();
  return [searchString, tags];
}
