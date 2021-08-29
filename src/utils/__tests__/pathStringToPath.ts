import { pathStringToPath } from '../pathStringToPath';

describe('pathStringToPath()', () => {
  it('should return expected path for given path string', () => {
    expect(pathStringToPath('/foo/bar')).toEqual({
      pathname: '/foo/bar',
    });
    expect(pathStringToPath('/foo/bar?baz=123')).toEqual({
      pathname: '/foo/bar',
      search: '?baz=123',
    });
    expect(pathStringToPath('/foo/bar?baz=123#abc')).toEqual({
      hash: '#abc',
      pathname: '/foo/bar',
      search: '?baz=123',
    });
    expect(pathStringToPath('/foo/bar?baz=123&qux=456#abc')).toEqual({
      hash: '#abc',
      pathname: '/foo/bar',
      search: '?baz=123&qux=456',
    });
  });

  it('should return original path if passed', () => {
    expect(
      pathStringToPath({ hash: '', pathname: '/foo/bar', search: '' })
    ).toEqual({
      hash: '',
      pathname: '/foo/bar',
      search: '',
    });
    expect(
      pathStringToPath({ hash: '', pathname: '/foo/bar', search: '?baz=123' })
    ).toEqual({ hash: '', pathname: '/foo/bar', search: '?baz=123' });
    expect(
      pathStringToPath({
        hash: '#abc',
        pathname: '/foo/bar',
        search: '?baz=123',
      })
    ).toEqual({ hash: '#abc', pathname: '/foo/bar', search: '?baz=123' });
  });

  it('should return path from partial path', () => {
    expect(pathStringToPath({ pathname: '/foo/bar' })).toEqual({
      hash: '',
      pathname: '/foo/bar',
      search: '',
    });
    expect(
      pathStringToPath({ pathname: '/foo/bar', search: '?baz=123' })
    ).toEqual({
      hash: '',
      pathname: '/foo/bar',
      search: '?baz=123',
    });
    expect(
      pathStringToPath({
        hash: '#abc',
        pathname: '/foo/bar',
      })
    ).toEqual({
      hash: '#abc',
      pathname: '/foo/bar',
      search: '',
    });
  });
});
