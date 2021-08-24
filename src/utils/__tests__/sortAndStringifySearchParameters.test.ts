/* eslint-disable sort-keys-fix/sort-keys-fix */
import { sortAndStringifySearchParameters } from '../sortAndStringifySearchParameters';

describe('sortAndStringifySearchParameters()', () => {
  it('should return sorted parameters as expected for simple object', () => {
    expect(
      sortAndStringifySearchParameters({
        foo: 'foo',
        bar: 'bar',
        qux: 'qux',
        baz: 'baz',
        zOO: 'zOO',
      })
    ).toBe('?bar=bar&baz=baz&foo=foo&qux=qux&zOO=zOO');
  });

  it('should return sorted params as expected for object with array values', () => {
    expect(
      sortAndStringifySearchParameters({
        red: 'red',
        fruits: ['orange', 'banana', 'apple', 'grape'],
        blue: 'blue',
      })
    ).toBe(
      '?blue=blue&fruits=apple&fruits=banana&fruits=grape&fruits=orange&red=red'
    );
  });

  it('should return encode values in returned string', () => {
    expect(
      sortAndStringifySearchParameters({
        red: 'red',
        encodeTest: 'abc 123',
      })
    ).toBe('?encodeTest=abc%20123&red=red');
  });
});
