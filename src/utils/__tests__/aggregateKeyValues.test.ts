import { aggregateKeyValues } from '../aggregateKeyValues';

describe('aggregateKeyValues', () => {
  it('should return single value to non-present key', () => {
    expect(aggregateKeyValues({}, 'foo', 'bar')).toBe('bar');
  });

  it('should return array of values to key that had single value', () => {
    expect(aggregateKeyValues({ foo: 'bar' }, 'foo', 'baz')).toEqual([
      'bar',
      'baz',
    ]);
  });

  it('should append value to existing array for given key', () => {
    expect(aggregateKeyValues({ foo: ['bar', 'baz'] }, 'foo', 'qux')).toEqual([
      'bar',
      'baz',
      'qux',
    ]);
  });

  it('should default to empty string when value is not passed in', () => {
    expect(aggregateKeyValues({}, 'foo')).toBe('');
  });

  it('should decode URI encoded values passed', () => {
    expect(aggregateKeyValues({}, 'foo', 'bar%20-%20baz')).toBe('bar - baz');

    expect(aggregateKeyValues({ foo: 'bar' }, 'foo', 'baz%20-%20qux')).toEqual([
      'bar',
      'baz - qux',
    ]);

    expect(
      aggregateKeyValues({ foo: ['bar', 'baz'] }, 'foo', 'qux%20-%20quux')
    ).toEqual(['bar', 'baz', 'qux - quux']);
  });
});
