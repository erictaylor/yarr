import type { MatchedRoute } from '../../types';
// import SuspenseResource from '../SuspenseResource';
import { prepareMatch } from '../prepareMatch';

jest.mock('../SuspenseResource', () => ({
  SuspenseResource: jest.fn().mockImplementation((componentName) => ({
    load: jest.fn(),
    read: jest.fn().mockReturnValue(`mock${componentName}`),
  })),
}));

describe('prepareMatch()', () => {
  it('should return prepared match without preload data', () => {
    const match = {
      location: { pathname: 'matchedLocation' },
      params: {},
      route: {
        component: { load: jest.fn() },
      },
      search: {},
    } as unknown as MatchedRoute;

    const preparedMatch = prepareMatch(match);

    expect(match.route.component.load).toHaveBeenCalledTimes(1);
    expect(match.route.component.load).toHaveBeenCalledWith();

    expect(preparedMatch).toEqual({
      component: match.route.component,
      location: match.location,
      params: match.params,
      search: match.search,
    });
  });

  it('should return prepared match and preload data', () => {
    const match = {
      location: { pathname: 'matchedLocation' },
      params: { foo: 'bar' },
      route: {
        component: { load: jest.fn() },
        preload: jest.fn().mockReturnValue('prefetchedData'),
      },
      search: { baz: 'qux' },
    } as unknown as MatchedRoute;

    const preparedMatch = prepareMatch(match);

    expect(match.route.component.load).toHaveBeenCalledTimes(1);
    expect(match.route.component.load).toHaveBeenCalledWith();
    expect(match.route.preload).toHaveBeenCalledTimes(1);
    expect(match.route.preload).toHaveBeenCalledWith(match.params);

    expect(preparedMatch).toEqual({
      component: match.route.component,
      location: match.location,
      params: match.params,
      preloaded: 'prefetchedData',
      search: match.search,
    });
  });

  it('should return prepared match with assistPreload true and no preload data', () => {
    const match = {
      location: { pathname: 'matchedLocation' },
      params: { foo: 'bar' },
      route: {
        component: { load: jest.fn() },
      },
      search: {},
    } as unknown as MatchedRoute;

    const preparedMatch = prepareMatch(match, true);

    expect(match.route.component.load).toHaveBeenCalledTimes(1);
    expect(match.route.component.load).toHaveBeenCalledWith();

    expect(preparedMatch).toEqual({
      component: match.route.component,
      location: match.location,
      params: match.params,
      search: match.search,
    });
  });

  it('should return prepared match with assistPreload true and with preload data', () => {
    const match = {
      location: { pathname: 'matchedLocation' },
      params: { foo: 'bar' },
      route: {
        component: { load: jest.fn() },
        preload: jest.fn().mockReturnValue({
          bar: { data: () => 'preloadedBar', defer: false },
          foo: () => 'preloadedFoo',
        }),
      },
      search: { baz: 'qux' },
    } as unknown as MatchedRoute;

    const preparedMatch = prepareMatch(match, true);

    expect(match.route.component.load).toHaveBeenCalledTimes(1);
    expect(match.route.component.load).toHaveBeenCalledWith();
    expect(match.route.preload).toHaveBeenCalledTimes(1);
    expect(match.route.preload).toHaveBeenCalledWith(match.params);

    expect(preparedMatch).toEqual({
      component: match.route.component,
      location: match.location,
      params: match.params,
      preloaded: new Map([
        [
          'foo',
          {
            data: { load: expect.any(Function), read: expect.any(Function) },
            defer: true,
          },
        ],
        [
          'bar',
          {
            data: { load: expect.any(Function), read: expect.any(Function) },
            defer: false,
          },
        ],
      ]),
      search: match.search,
    });

    expect(
      preparedMatch.preloaded?.get('foo')?.data.load
    ).toHaveBeenCalledTimes(1);
    expect(
      preparedMatch.preloaded?.get('foo')?.data.load
    ).toHaveBeenCalledWith();
    expect(
      preparedMatch.preloaded?.get('bar')?.data.load
    ).toHaveBeenCalledTimes(1);
    expect(
      preparedMatch.preloaded?.get('bar')?.data.load
    ).toHaveBeenCalledWith();
  });

  it('should return prepared match with assistPreload true and awaitPreload true', () => {
    const match = {
      location: { pathname: 'matchedLocation' },
      params: { baz: 'qux', foo: 'bar' },
      route: {
        component: { load: jest.fn() },
        preload: jest.fn().mockReturnValue({
          bar: () => 'preloadedBar',
          foo: { data: () => 'preloadedFoo', defer: true },
        }),
      },
      search: {},
    } as unknown as MatchedRoute;

    const preparedMatch = prepareMatch(match, true, true);

    expect(match.route.preload).toHaveBeenCalledTimes(1);
    expect(match.route.preload).toHaveBeenCalledWith(match.params);
    expect(match.route.component.load).toHaveBeenCalledTimes(1);
    expect(match.route.component.load).toHaveBeenCalledWith();

    expect(preparedMatch).toEqual({
      component: match.route.component,
      location: match.location,
      params: match.params,
      preloaded: new Map([
        [
          'foo',
          {
            data: { load: expect.any(Function), read: expect.any(Function) },
            defer: true,
          },
        ],
        [
          'bar',
          {
            data: { load: expect.any(Function), read: expect.any(Function) },
            defer: false,
          },
        ],
      ]),
      search: match.search,
    });

    expect(
      preparedMatch.preloaded?.get('bar')?.data.load
    ).toHaveBeenCalledTimes(1);
    expect(
      preparedMatch.preloaded?.get('bar')?.data.load
    ).toHaveBeenCalledWith();
    expect(
      preparedMatch.preloaded?.get('foo')?.data.load
    ).toHaveBeenCalledTimes(1);
    expect(
      preparedMatch.preloaded?.get('foo')?.data.load
    ).toHaveBeenCalledWith();
  });

  it('should return cached match when route is the same as last run and assistPreload is true', () => {
    const firstMatch = {
      location: { pathname: 'consecutiveMatch' },
      params: { baz: 'qux', foo: 'bar' },
      route: {
        component: { load: jest.fn() },
        preload: jest.fn().mockReturnValue({
          bar: () => 'preloadedBar',
          foo: { data: () => 'preloadedFoo', defer: true },
        }),
      },
      search: { search: 'search' },
    } as unknown as MatchedRoute;

    const secondMatch = {
      location: { pathname: 'consecutiveMatch' },
      params: { baz: 'qux', foo: 'bar' },
      route: {
        component: { load: jest.fn() },
        preload: jest.fn().mockReturnValue({
          bar: () => 'preloadedBar',
          foo: { data: () => 'preloadedFoo', defer: true },
        }),
      },
      search: { search: 'search' },
    } as unknown as MatchedRoute;

    const firstPreparedMatch = prepareMatch(firstMatch, true, true);

    expect(firstMatch.route.preload).toHaveBeenCalledTimes(1);
    expect(firstMatch.route.component.load).toHaveBeenCalledTimes(1);

    const secondPreparedMatch = prepareMatch(secondMatch, true, true);

    expect(secondMatch.route.preload).not.toHaveBeenCalled();
    expect(secondMatch.route.component.load).not.toHaveBeenCalled();

    expect(secondPreparedMatch).toEqual({
      component: firstMatch.route.component,
      location: firstMatch.location,
      params: firstMatch.params,
      preloaded: new Map([
        [
          'foo',
          {
            data: { load: expect.any(Function), read: expect.any(Function) },
            defer: true,
          },
        ],
        [
          'bar',
          {
            data: { load: expect.any(Function), read: expect.any(Function) },
            defer: false,
          },
        ],
      ]),
      search: firstMatch.search,
    });

    // Called only one is previous test.
    expect(
      firstPreparedMatch.preloaded?.get('bar')?.data.load
    ).toHaveBeenCalledTimes(1);
    expect(
      firstPreparedMatch.preloaded?.get('bar')?.data.load
    ).toHaveBeenCalledWith();
    expect(
      firstPreparedMatch.preloaded?.get('foo')?.data.load
    ).toHaveBeenCalledTimes(1);
    expect(
      firstPreparedMatch.preloaded?.get('foo')?.data.load
    ).toHaveBeenCalledWith();
  });
});
