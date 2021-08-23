import type { RoutesEntryMap } from '../../types';
import { matchRoutes } from '../matchRoutes';

describe('matchRoutes()', () => {
  const routesEntryMap = new Map([
    ['/', { component: 'RootComponent' }],
    ['/login', { component: 'LoginComponent' }],
    [
      '/user',
      {
        component: 'UserComponent',
        redirectRules: jest.fn().mockReturnValue('/login'),
      },
    ],
    ['/user/transactions', { component: 'TransactionsComponent' }],
    [
      '/user/transactions/:transactionId',
      { component: 'TransactionComponent' },
    ],
    [
      '/user/transactions/:transactionId/details',
      { component: 'TransactionDetailsComponent' },
    ],
    ['/about', { component: 'AboutComponent' }],
    ['/*', { component: 'NotFoundComponent' }],
  ]) as unknown as RoutesEntryMap;

  it('should match pathname only', () => {
    expect(matchRoutes(routesEntryMap, '/user/transactions')).toEqual({
      location: { pathname: '/user/transactions' },
      params: {},
      route: { component: 'TransactionsComponent' },
    });
  });

  it('should match pathname with query parameters', () => {
    expect(matchRoutes(routesEntryMap, '/user/transactions?foo=bar')).toEqual({
      location: { pathname: '/user/transactions', search: '?foo=bar' },
      params: { foo: 'bar' },
      route: { component: 'TransactionsComponent' },
    });
  });

  it('should match pathname with hash', () => {
    expect(matchRoutes(routesEntryMap, '/user/transactions#abc')).toEqual({
      location: { hash: '#abc', pathname: '/user/transactions' },
      params: {},
      route: { component: 'TransactionsComponent' },
    });
  });

  it('should match pathname with both query parameters and hash', () => {
    expect(
      matchRoutes(routesEntryMap, '/user/transactions?foo=bar#abc')
    ).toEqual({
      location: {
        hash: '#abc',
        pathname: '/user/transactions',
        search: '?foo=bar',
      },
      params: { foo: 'bar' },
      route: { component: 'TransactionsComponent' },
    });
  });

  it('should match location fragment with both query parameters and hash', () => {
    expect(
      matchRoutes(routesEntryMap, {
        hash: '#abc',
        pathname: '/user/transactions',
        search: '?foo=bar',
      })
    ).toEqual({
      location: {
        hash: '#abc',
        pathname: '/user/transactions',
        search: '?foo=bar',
      },
      params: { foo: 'bar' },
      route: { component: 'TransactionsComponent' },
    });
  });

  it('should match pathname with named parameters', () => {
    expect(matchRoutes(routesEntryMap, '/user/transactions/123')).toEqual({
      location: { pathname: '/user/transactions/123' },
      params: { transactionId: '123' },
      route: { component: 'TransactionComponent' },
    });
  });

  it('should apply redirect rules for match and return correct route', () => {
    expect(matchRoutes(routesEntryMap, '/user?foo=bar')).toEqual({
      location: { pathname: '/login' },
      params: {},
      route: { component: 'LoginComponent' },
    });

    expect(routesEntryMap.get('/user')?.redirectRules).toHaveBeenCalledTimes(1);
    expect(routesEntryMap.get('/user')?.redirectRules).toHaveBeenCalledWith({
      foo: 'bar',
    });
  });

  it('shoud match wildcard (*) route when pathname is not found', () => {
    expect(matchRoutes(routesEntryMap, '/foo')).toEqual({
      location: { pathname: '/foo' },
      params: {},
      route: { component: 'NotFoundComponent' },
    });
  });

  it('should throw error when pathname is not found and no wildcard route is provided', () => {
    const routesEntryMapWithNoWildcard = new Map(routesEntryMap);
    routesEntryMapWithNoWildcard.delete('/*');

    expect(() => matchRoutes(routesEntryMapWithNoWildcard, '/foo')).toThrow(
      /(?=.*?\bno route found)(?=.*?\bwildcard).*\n?(?=.*?\broute).*\n?(?=.*?\bcatch-all).*/i
    );
  });
});
