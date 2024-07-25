import { trim } from '../trim';

describe('Trim', () => {
  it('Should trim text to 5 characters', () => {
    expect(trim('searchText', 5)).toEqual('searc...');
  });
});
