import { getFileNameFromText } from '../file-name-from-text';

describe('file-name-from-text', () => {
  it('Should replace extra character from text', () => {
    const text = 'This is a test text.';
    const fileName = getFileNameFromText(text);

    expect(fileName).toEqual('this-is-a-test-text');
  });

  it('Should replace extra characters with not english sentence', () => {
    const text = 'Привет мир!';
    const fileName = getFileNameFromText(text);

    expect(fileName).toEqual('привет-мир');
  });
});
