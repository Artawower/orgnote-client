import { exctractSearchInfo } from '../extract-search-info';

describe('extract-search-info', () => {
  it('Should extract search info from search string with tags and text', () => {
    const searchText = 'sesarch #tag1 #tag2';
    const { searchQuery, tags, scope } = exctractSearchInfo(searchText);

    expect(searchQuery).toBe('sesarch');
    expect(tags).toEqual(['tag1', 'tag2']);
    expect(scope).toBeUndefined();
  });

  it('Should extract tags from string which contains only tags', () => {
    const searchText = '#tag1 #tag2';
    const { searchQuery, tags, scope } = exctractSearchInfo(searchText);

    expect(searchQuery).toBe('');
    expect(tags).toEqual(['tag1', 'tag2']);
    expect(scope).toBeUndefined();
  });

  it('Should extract search string from string which contains only search string', () => {
    const searchText = 'search text';
    const { searchQuery, tags, scope } = exctractSearchInfo(searchText);

    expect(searchQuery).toBe('search text');
    expect(tags).toEqual([]);
    expect(scope).toBeUndefined();
  });

  it('Should not extract tag from search string where only hash symbol', () => {
    const searchText = '# this is search text';
    const { searchQuery, tags, scope } = exctractSearchInfo(searchText);

    expect(searchQuery).toBe('this is search text');
    expect(tags).toEqual([]);
    expect(scope).toBeUndefined();
  });

  it('Should extract file tag with dash inside', () => {
    const searchText = '#tag-1';
    const { searchQuery, tags, scope } = exctractSearchInfo(searchText);

    expect(searchQuery).toBe('');
    expect(tags).toEqual(['tag-1']);
    expect(scope).toBeUndefined();
  });

  it('Should parse correct scope', () => {
    const searchText = '@bookmark';
    const { searchQuery, tags, scope } = exctractSearchInfo(searchText);

    expect(searchQuery).toBe('');
    expect(tags).toEqual([]);
    expect(scope).toBe('@bookmark');
  });

  it('Should not parse scope from the middle of the string', () => {
    const searchText = 'search @bookmarks';
    const { searchQuery, tags, scope } = exctractSearchInfo(searchText);

    expect(searchQuery).toBe('search @bookmarks');
    expect(tags).toEqual([]);
    expect(scope).toBeUndefined();
  });
});
