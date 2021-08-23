import type { RoutesConfig } from '../../types';
import { SuspenseResource } from '../SuspenseResource';
import { routesToEntryMap } from '../routesToEntryMap';

jest.mock('../SuspenseResource', () => {
  return {
    SuspenseResource: jest.fn().mockImplementation((componentName) => ({
      load: jest.fn(),
      read: jest.fn().mockReturnValue(`mock${componentName}`),
    })),
  };
});

describe('routesToEntryMap()', () => {
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

  afterEach(() => {
    warnSpy.mockClear();
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it('should set each entry component to a SuspenseResource', () => {
    const routes = [
      {
        children: [
          { component: 'About', path: 'about' },
          { component: 'NotFound', path: '*' },
        ],
        component: 'Root',
        path: '/',
      },
    ];

    const routesEntryMap = routesToEntryMap(routes as unknown as RoutesConfig);

    expect(SuspenseResource).toHaveBeenCalledTimes(3);
    expect(SuspenseResource).toHaveBeenNthCalledWith(1, 'Root');
    expect(SuspenseResource).toHaveBeenNthCalledWith(2, 'About');
    expect(SuspenseResource).toHaveBeenNthCalledWith(3, 'NotFound');

    expect(routesEntryMap).toEqual(
      new Map([
        [
          '/',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/about',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/*',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
      ])
    );
  });

  it('should transform simple array of routes to Map', () => {
    const routes = [
      {
        children: [
          { component: 'About', path: 'about' },
          { component: 'Search', path: 'search' },
          { component: 'NotFound', path: '*' },
        ],
        component: 'Root',
        path: '/',
      },
    ];

    expect(routesToEntryMap(routes as unknown as RoutesConfig)).toEqual(
      new Map([
        [
          '/',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/about',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/search',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/*',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
      ])
    );
  });

  it('should warn about missing wildcard route in non-production environment', () => {
    const routes = [
      {
        children: [
          { component: 'About', path: 'about' },
          { component: 'Search', path: 'search' },
        ],
        component: 'Root',
        path: '/',
      },
    ];

    routesToEntryMap(routes as unknown as RoutesConfig);

    /* eslint-disable no-console */
    expect(console.warn).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringMatching(
        /(?=.*?\bwildcard)(?=.*?\broute).*\n?(?=.*?\bnot found).*\n?(?=.*?\b404).*/i
      )
    );
    /* eslint-enable no-console */
  });

  it('should transform array of routes with nested children to Map', () => {
    const routes = [
      {
        children: [
          { component: 'About', path: 'about' },
          { component: 'Search', path: 'search' },
          {
            children: [
              {
                children: [
                  { component: 'Transaction', path: ':transactionId' },
                ],
                component: 'Transactions',
                path: 'transactions',
              },
            ],
            component: 'User',
            path: 'user',
          },
          { component: 'NotFound', path: '*' },
        ],
        component: 'Root',
        path: '/',
      },
    ];

    expect(routesToEntryMap(routes as unknown as RoutesConfig)).toEqual(
      new Map([
        [
          '/',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/about',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/search',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/user',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/user/transactions',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/user/transactions/:transactionId',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/*',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
      ])
    );
  });

  it('should merge pass redirectRules from parent route to children', () => {
    const preload = jest.fn(() => ({ foo: 'bar' }));
    const redirectRule = jest.fn(() => null);
    const routes = [
      {
        children: [
          { component: 'About', path: 'about' },
          { component: 'Search', path: 'search' },
          {
            children: [
              {
                children: [
                  {
                    children: [
                      { component: 'TransactionDetail', path: 'detail' },
                    ],
                    component: 'Transaction',
                    path: ':transactionId',
                  },
                ],
                component: 'Transactions',
                path: 'transactions',
              },
            ],
            component: 'User',
            path: 'user',
            preload,
            redirectRules: redirectRule,
          },
          { component: 'NotFound', path: '*' },
        ],
        component: 'Root',
        path: '/',
      },
    ];

    expect(routesToEntryMap(routes as unknown as RoutesConfig)).toEqual(
      new Map([
        [
          '/',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/about',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/search',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/user',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
            preload,
            redirectRules: redirectRule,
          },
        ],
        [
          '/user/transactions',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
            redirectRules: redirectRule,
          },
        ],
        [
          '/user/transactions/:transactionId',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
            redirectRules: redirectRule,
          },
        ],
        [
          '/user/transactions/:transactionId/detail',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
            redirectRules: redirectRule,
          },
        ],
        [
          '/*',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
      ])
    );
  });

  it('should override redirectRules from parent if provided on child route', () => {
    const redirectRuleLevel1 = jest.fn(() => null);
    const redirectRuleLevel2 = jest.fn(() => null);

    const routes = [
      {
        children: [
          { component: 'About', path: 'about' },
          { component: 'Search', path: 'search' },
          {
            children: [
              {
                children: [
                  {
                    children: [
                      { component: 'TransactionDetail', path: 'detail' },
                    ],
                    component: 'Transaction',
                    path: ':transactionId',
                    redirectRules: redirectRuleLevel2,
                  },
                ],
                component: 'Transactions',
                path: 'transactions',
              },
            ],
            component: 'User',
            path: 'user',
            redirectRules: redirectRuleLevel1,
          },
          { component: 'NotFound', path: '*' },
        ],
        component: 'Root',
        path: '/',
      },
    ];

    expect(routesToEntryMap(routes as unknown as RoutesConfig)).toEqual(
      new Map([
        [
          '/',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/about',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/search',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
        [
          '/user',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
            redirectRules: redirectRuleLevel1,
          },
        ],
        [
          '/user/transactions',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
            redirectRules: redirectRuleLevel1,
          },
        ],
        [
          '/user/transactions/:transactionId',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
            redirectRules: redirectRuleLevel2,
          },
        ],
        [
          '/user/transactions/:transactionId/detail',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
            redirectRules: redirectRuleLevel2,
          },
        ],
        [
          '/*',
          {
            component: {
              load: expect.any(Function),
              read: expect.any(Function),
            },
          },
        ],
      ])
    );
  });
});
