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
      key: '/user/transactions',
      location: { hash: '', pathname: '/user/transactions', search: '' },
      params: {},
      route: { component: 'TransactionsComponent' },
      search: {},
    });
  });

  it('should match pathname with search parameters', () => {
    expect(matchRoutes(routesEntryMap, '/user/transactions?foo=bar')).toEqual({
      key: '/user/transactions',
      location: {
        hash: '',
        pathname: '/user/transactions',
        search: '?foo=bar',
      },
      params: {},
      route: { component: 'TransactionsComponent' },
      search: { foo: 'bar' },
    });
  });

  it('should match pathname with hash', () => {
    expect(matchRoutes(routesEntryMap, '/user/transactions#abc')).toEqual({
      key: '/user/transactions',
      location: { hash: '#abc', pathname: '/user/transactions', search: '' },
      params: {},
      route: { component: 'TransactionsComponent' },
      search: {},
    });
  });

  it('should match pathname with both search parameters and hash', () => {
    expect(
      matchRoutes(routesEntryMap, '/user/transactions?foo=bar#abc')
    ).toEqual({
      key: '/user/transactions',
      location: {
        hash: '#abc',
        pathname: '/user/transactions',
        search: '?foo=bar',
      },
      params: {},
      route: { component: 'TransactionsComponent' },
      search: { foo: 'bar' },
    });
  });

  it('should match location fragment with both search parameters and hash', () => {
    expect(
      matchRoutes(routesEntryMap, {
        hash: '#abc',
        pathname: '/user/transactions',
        search: '?foo=bar',
      })
    ).toEqual({
      key: '/user/transactions',
      location: {
        hash: '#abc',
        pathname: '/user/transactions',
        search: '?foo=bar',
      },
      params: {},
      route: { component: 'TransactionsComponent' },
      search: { foo: 'bar' },
    });
  });

  it('should match pathname with named parameters', () => {
    expect(matchRoutes(routesEntryMap, '/user/transactions/123')).toEqual({
      key: '/user/transactions/:transactionId',
      location: { hash: '', pathname: '/user/transactions/123', search: '' },
      params: { transactionId: '123' },
      route: { component: 'TransactionComponent' },
      search: {},
    });
  });

  it('should apply redirect rules for match and return correct route', () => {
    expect(matchRoutes(routesEntryMap, '/user?foo=bar')).toEqual({
      key: '/login',
      location: { hash: '', pathname: '/login', search: '' },
      params: {},
      route: { component: 'LoginComponent' },
      search: {},
    });

    expect(routesEntryMap.get('/user')?.redirectRules).toHaveBeenCalledTimes(1);
    expect(routesEntryMap.get('/user')?.redirectRules).toHaveBeenCalledWith(
      {},
      {
        foo: 'bar',
      }
    );
  });

  it('shoud match wildcard (*) route when pathname is not found', () => {
    expect(matchRoutes(routesEntryMap, '/foo')).toEqual({
      key: '/*',
      location: { hash: '', pathname: '/foo', search: '' },
      params: {},
      route: { component: 'NotFoundComponent' },
      search: {},
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
