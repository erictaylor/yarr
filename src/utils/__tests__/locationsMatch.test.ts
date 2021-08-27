import { locationsMatch } from '../locationsMatch';

describe('locationsMatch()', () => {
  it.each`
    left                                                          | right
    ${'/foo/bar'}                                                 | ${'/foo/bar'}
    ${'/foo/bar?baz=123'}                                         | ${'/foo/bar?baz=456'}
    ${'/foo/bar#abc'}                                             | ${'/foo/bar#def'}
    ${'/foo/bar?baz=123#abc'}                                     | ${'/foo/bar?baz=456#def'}
    ${{ pathname: '/foo/bar' }}                                   | ${'/foo/bar'}
    ${{ pathname: '/foo/bar' }}                                   | ${{ pathname: '/foo/bar' }}
    ${{ pathname: '/foo/bar', search: '?baz=123' }}               | ${{ pathname: '/foo/bar', search: '?baz=456' }}
    ${{ hash: '#abc', pathname: '/foo/bar', search: '?baz=123' }} | ${{ hash: '#def', pathname: '/foo/bar', search: '?baz=456' }}
  `(
    'should return `true` for non-exact matching location pathnames',
    ({ left, right }) => {
      expect(locationsMatch(left, right)).toBe(true);
    }
  );

  it.each`
    left                                                          | right
    ${'/foo/bar'}                                                 | ${'/foo/qux'}
    ${'/foo/bar?baz=123'}                                         | ${'/foo/qux?baz=456'}
    ${'/foo/bar#abc'}                                             | ${'/foo/qux#def'}
    ${'/foo/bar?baz=123#abc'}                                     | ${'/foo/qux?baz=456#def'}
    ${{ pathname: '/foo/bar' }}                                   | ${'/foo/qux'}
    ${{ pathname: '/foo/bar' }}                                   | ${{ pathname: '/foo/qux' }}
    ${{ pathname: '/foo/bar', search: '?baz=123' }}               | ${{ pathname: '/foo/qux', search: '?baz=456' }}
    ${{ hash: '#abc', pathname: '/foo/bar', search: '?baz=123' }} | ${{ hash: '#def', pathname: '/foo/qux', search: '?baz=456' }}
  `(
    'should return `false` for non-exact different location pathnames',
    ({ left, right }) => {
      expect(locationsMatch(left, right)).toBe(false);
    }
  );

  it.each`
    left                                                          | right
    ${'/foo/bar'}                                                 | ${'/foo/bar'}
    ${'/foo/bar?baz=123'}                                         | ${'/foo/bar?baz=123'}
    ${'/foo/bar#abc'}                                             | ${'/foo/bar#abc'}
    ${'/foo/bar?baz=123#abc'}                                     | ${'/foo/bar?baz=123#abc'}
    ${{ pathname: '/foo/bar' }}                                   | ${'/foo/bar'}
    ${{ pathname: '/foo/bar' }}                                   | ${{ pathname: '/foo/bar' }}
    ${{ pathname: '/foo/bar', search: '?baz=123' }}               | ${{ pathname: '/foo/bar', search: '?baz=123' }}
    ${{ hash: '#abc', pathname: '/foo/bar', search: '?baz=123' }} | ${{ hash: '#abc', pathname: '/foo/bar', search: '?baz=123' }}
    ${'/foo/bar?baz=123&qux=456'}                                 | ${'/foo/bar?qux=456&baz=123'}
  `('should return `true` for exact matching locations', ({ left, right }) => {
    expect(locationsMatch(left, right, true)).toBe(true);
  });

  it.each`
    left                                                          | right
    ${'/foo/bar'}                                                 | ${'/foo/qux'}
    ${'/foo/bar?baz=123'}                                         | ${'/foo/bar?baz=456'}
    ${'/foo/bar#abc'}                                             | ${'/foo/bar#def'}
    ${'/foo/bar?baz=123#abc'}                                     | ${'/foo/bar?baz=123#def'}
    ${{ pathname: '/foo/bar' }}                                   | ${'/foo/qux'}
    ${{ pathname: '/foo/bar' }}                                   | ${{ pathname: '/foo/qux' }}
    ${{ pathname: '/foo/bar', search: '?baz=123' }}               | ${{ pathname: '/foo/bar', search: '?baz=456' }}
    ${{ hash: '#abc', pathname: '/foo/bar', search: '?baz=123' }} | ${{ hash: '#def', pathname: '/foo/bar', search: '?baz=123' }}
    ${'/foo/bar?baz=123&qux=456'}                                 | ${'/foo/bar?qux=123&baz=456'}
  `(
    'should return `false` for non-exact matching locations',
    ({ left, right }) => {
      expect(locationsMatch(left, right, true)).toBe(false);
    }
  );
});
