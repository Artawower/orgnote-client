import { searchFilter, searchObject } from '../search-filter';

describe('search filter', () => {
  it('Should find the correct item', () => {
    const val = 'hello world';
    const searchQuery = 'HELLO';
    const res = searchFilter(searchQuery, val);
    expect(res).toBe(true);
  });
  it('Should not find the correct item', () => {
    const val = 'hello world';
    const searchQuery = 'hi!';
    const res = searchFilter(val, searchQuery);
    expect(res).toBe(false);
  });
  it("Should find the correct item when source string doesn't provided", () => {
    const searchQuery = '';
    const res = searchFilter(searchQuery, 'hey', '123');
    expect(res).toBe(true);
  });
  it("Should find the correct item when search strings don't provided", () => {
    const val = 'hello world';
    const res = searchFilter(null, val);
    expect(res).toBe(true);
  });
});

describe('search object', () => {
  it('Should find the correct item', () => {
    const val = {
      name: 'hello world',
    };

    const searchStr = 'HELLO';

    const res = searchObject(searchStr, 'name')(val);
    expect(res).toBe(true);
  });

  it('Should not find value in the object', () => {
    const val = {
      name: 'hello world',
      description: 'and bye',
    };

    const searchStr = 'b9';

    const res = searchObject(searchStr, 'name', 'description')(val);
    expect(res).toBe(false);
  });

  it('Should find value in one of the object keys', () => {
    const val = {
      name: 'hello world',
      description: 'and bye',
    };

    const searchStr = 'bye';

    const res = searchObject(searchStr, 'name', 'description')(val);
    expect(res).toBe(true);
  });
});
