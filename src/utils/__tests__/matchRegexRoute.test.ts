import { matchRegexRoute } from '../matchRegexRoute';

describe('matchRegexRoute()', () => {
  it('matches correctly when expecting positive result', () => {
    expect(matchRegexRoute('/path/:parameter', '/path/foo')).toEqual({
      params: { parameter: 'foo' },
    });
    expect(matchRegexRoute('/:resource/:id', '/path/subpath')).toEqual({
      params: { id: 'subpath', resource: 'path' },
    });
    expect(
      matchRegexRoute('/:part1-:part2-:part3', '/test1-test2-test3')
    ).toEqual({
      params: { part1: 'test1', part2: 'test2', part3: 'test3' },
    });
    expect(matchRegexRoute('/:foo/*', '/test/route')).toEqual({
      params: { $rest: 'route', foo: 'test' },
    });
    expect(matchRegexRoute('/:foo/*', '/test/route/child')).toEqual({
      params: { $rest: 'route/child', foo: 'test' },
    });
    expect(matchRegexRoute('/:foo/*/*', '/test/route/child')).toEqual({
      params: { $rest: ['route', 'child'], foo: 'test' },
    });
    expect(matchRegexRoute('/:foo*', '/bar/baz')).toEqual({
      params: { $rest: '/baz', foo: 'bar' },
    });
    expect(
      matchRegexRoute('/:foo/file/prefix-*.*', '/bar/file/prefix-baz.js')
    ).toEqual({
      params: { $rest: ['baz', 'js'], foo: 'bar' },
    });
    expect(
      matchRegexRoute(
        '/:foo/file/prefix-*.:extension',
        '/bar/file/prefix-baz.js'
      )
    ).toEqual({
      params: { $rest: 'baz', extension: 'js', foo: 'bar' },
    });
    expect(
      matchRegexRoute(
        '/search/:tableName?useIndex=true&term=amazing',
        '/search/people?useIndex=true&term=amazing'
      )
    ).toEqual({
      params: { tableName: 'people' },
    });
  });

  it('matches correctly when expecting negative result', () => {
    expect(matchRegexRoute('/path/subpath', '/path/sub-path')).toEqual(null);
    expect(matchRegexRoute('/path/:parameter', '/path/foo/bar')).toEqual(null);
    expect(matchRegexRoute('/:foo/:bar', '/foo/bar/baz')).toEqual(null);
    expect(
      matchRegexRoute('/:part1-:part2-:part3', '/test1/test2/test3')
    ).toEqual(null);
    expect(matchRegexRoute('/:foo/file/*.js', '/bar/file/baz.jsx')).toEqual(
      null
    );
    // TODO: Maybe we should support this?
    expect(
      matchRegexRoute(
        '/search/:resource?useIndex=true&term=amazing',
        '/search/people?term=amazing&useIndex=true'
      )
    ).toEqual(null);
  });
});
