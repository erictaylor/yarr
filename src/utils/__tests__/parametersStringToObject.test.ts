import { parametersStringToObject } from '../parametersStringToObject';

describe('parametersStringToObject()', () => {
  it('should return empty object if empty string passed', () => {
    expect(parametersStringToObject('')).toEqual({});
  });

  it('correctly transforms string of query params to object', () => {
    expect(parametersStringToObject('?foo=bar&baz=qux&quux=quuz')).toEqual({
      baz: 'qux',
      foo: 'bar',
      quux: 'quuz',
    });
  });

  it('correctly transforms string of query params to object with nested parameters', () => {
    expect(
      parametersStringToObject(
        '?foo=bar&baz=qux&quux=quuz&quux=corge&quux=grault'
      )
    ).toEqual({
      baz: 'qux',
      foo: 'bar',
      quux: ['quuz', 'corge', 'grault'],
    });
  });
});
