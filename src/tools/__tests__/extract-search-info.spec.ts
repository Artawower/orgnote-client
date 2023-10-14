import { exctractSearchInfo } from '../extract-search-info';

describe('extract-search-info', () => {
  it('Should extract search info from search string with tags and text', () => {
    const searchText = 'sesarch #tag1 #tag2';
    const [searchString, tags] = exctractSearchInfo(searchText);

    expect(searchString).toBe('sesarch');
    expect(tags).toEqual(['tag1', 'tag2']);
  });

  it('Should extract tags from string which contains only tags', () => {
    const searchText = '#tag1 #tag2';
    const [searchString, tags] = exctractSearchInfo(searchText);

    expect(searchString).toBe('');
    expect(tags).toEqual(['tag1', 'tag2']);
  });

  it('Should extract search string from string which contains only search string', () => {
    const searchText = 'search text';
    const [searchString, tags] = exctractSearchInfo(searchText);

    expect(searchString).toBe('search text');
    expect(tags).toEqual([]);
  });

  it('Should not extract tag from search string where only hash symbol', () => {
    const searchText = '# this is search text';
    const [searchString, tags] = exctractSearchInfo(searchText);

    expect(searchString).toBe('this is search text');
    expect(tags).toEqual([]);
  });

  it('Should extract file tag with dash inside', () => {
    const searchText = '#tag-1';
    const [searchString, tags] = exctractSearchInfo(searchText);

    expect(searchString).toBe('');
    expect(tags).toEqual(['tag-1']);
  });
});
