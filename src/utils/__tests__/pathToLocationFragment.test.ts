import { pathToLocationFragment } from '../pathToLocationFragment';

describe('pathToLocationFragment()', () => {
  it('should return expected path fragment for given path string', () => {
    expect(pathToLocationFragment('/foo/bar')).toEqual({
      pathname: '/foo/bar',
    });
    expect(pathToLocationFragment('/foo/bar?baz=123')).toEqual({
      pathname: '/foo/bar',
      search: '?baz=123',
    });
    expect(pathToLocationFragment('/foo/bar?baz=123#abc')).toEqual({
      hash: '#abc',
      pathname: '/foo/bar',
      search: '?baz=123',
    });
    expect(pathToLocationFragment('/foo/bar?baz=123&qux=456#abc')).toEqual({
      hash: '#abc',
      pathname: '/foo/bar',
      search: '?baz=123&qux=456',
    });
  });

  it('should return original path fragment if passed', () => {
    expect(pathToLocationFragment({ pathname: '/foo/bar' })).toEqual({
      pathname: '/foo/bar',
    });
    expect(
      pathToLocationFragment({ pathname: '/foo/bar', search: '?baz=123' })
    ).toEqual({ pathname: '/foo/bar', search: '?baz=123' });
    expect(
      pathToLocationFragment({
        hash: '#abc',
        pathname: '/foo/bar',
        search: '?baz=123',
      })
    ).toEqual({ hash: '#abc', pathname: '/foo/bar', search: '?baz=123' });
  });
});
