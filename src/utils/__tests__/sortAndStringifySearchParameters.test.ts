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
      })
    ).toBe('?bar=bar&baz=baz&foo=foo&qux=qux');
  });

  it('should return sorted params as expected for object with array values', () => {
    expect(
      sortAndStringifySearchParameters({
        red: 'red',
        fruits: ['orange', 'banana', 'apple', 'grape'],
        blue: 'blue',
      })
    ).toBe('?blue=blue&fruits=apple,banana,grape,orange&red=red');
  });
});
