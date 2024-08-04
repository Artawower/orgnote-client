import { toSentence } from '../case-converter';

describe('extract-search-info', () => {
  it('Should convert camel case to words', () => {
    const text = 'searchText';
    expect(toSentence(text)).toEqual('search text');
  });
});
