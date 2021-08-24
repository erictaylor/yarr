import { queryStringToObject } from '../queryStringToObject';

describe('queryStringToObject()', () => {
  it('should return empty object if empty string passed', () => {
    expect(queryStringToObject('')).toEqual({});
  });

  it('correctly transforms string of query params to object', () => {
    expect(queryStringToObject('?foo=bar&baz=qux&quux=quuz')).toEqual({
      baz: 'qux',
      foo: 'bar',
      quux: 'quuz',
    });
  });

  it('correctly transforms string of query params to object with nested parameters', () => {
    expect(
      queryStringToObject('?foo=bar&baz=qux&quux=quuz&quux=corge&quux=grault')
    ).toEqual({
      baz: 'qux',
      foo: 'bar',
      quux: ['quuz', 'corge', 'grault'],
    });
  });

  it('should decode URI components', () => {
    expect(queryStringToObject('?foo=ABC%20abc%20123')).toEqual({
      foo: 'ABC abc 123',
    });

    expect(queryStringToObject('?foo=ABC%20abc%20123&foo=%24')).toEqual({
      foo: ['ABC abc 123', '$'],
    });
  });
});
