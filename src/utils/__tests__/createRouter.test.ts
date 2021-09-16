import { createMemoryHistory } from 'history';
import type { CreateRouterOptions, RoutesConfig, State } from '../../types';
import { createRouter } from '../createRouter';
import { locationsMatch } from '../locationsMatch';
import { matchRoutes } from '../matchRoutes';
import { prepareMatch } from '../prepareMatch';
import { routesToEntryMap } from '../routesToEntryMap';

jest.mock('../routesToEntryMap', () => ({
  routesToEntryMap: jest.fn(() => 'routesEntryMap'),
}));

const componentLoadMock = jest.fn();

jest.mock('../matchRoutes', () => ({
  matchRoutes: jest.fn(() => ({
    location: 'matchedLocation',
    route: { component: { load: componentLoadMock } },
  })),
}));

jest.mock('../prepareMatch', () => ({
  prepareMatch: jest.fn(() => ({
    component: { load: componentLoadMock },
    location: 'preparedLocation',
  })),
}));

jest.mock('../locationsMatch', () => ({
  locationsMatch: jest.fn(() => true),
}));

const mockLocationsMatch = locationsMatch as unknown as jest.Mock<boolean>;
const mockPrepareMatch = prepareMatch as unknown as jest.Mock<{
  component: { load: () => void };
  location: string;
}>;

describe('createRouter()', () => {
  const defaultRouterOptions: CreateRouterOptions<RoutesConfig> = {
    assistPreload: true,
    awaitComponent: true,
    awaitPreload: false,
    history: {
      action: 'PUSH',
      block: jest.fn(),
      createHref: jest.fn(),
      go: jest.fn(),
      goBack: jest.fn(),
      goForward: jest.fn(),
      length: 0,
      listen: jest.fn(),
      location: {
        hash: '',
        key: 'historyKey',
        pathname: 'historyLocation',
        search: '',
        state: undefined,
      },
      push: jest.fn(),
      replace: jest.fn(),
    },
    routes: [
      {
        component: jest.fn(),
        path: 'foo',
      },
      {
        component: jest.fn(),
        path: '*',
      },
    ],
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should run the expected functions when called', () => {
    createRouter(defaultRouterOptions);

    expect(routesToEntryMap).toHaveBeenCalledTimes(1);
    expect(routesToEntryMap).toHaveBeenCalledWith(defaultRouterOptions.routes);

    expect(matchRoutes).toHaveBeenCalledTimes(1);
    expect(matchRoutes).toHaveBeenCalledWith(
      'routesEntryMap',
      defaultRouterOptions.history.location
    );

    expect(prepareMatch).toHaveBeenCalledTimes(1);
    expect(prepareMatch).toHaveBeenCalledWith(
      {
        location: 'matchedLocation',
        route: { component: { load: expect.any(Function) } },
      },
      defaultRouterOptions.assistPreload,
      defaultRouterOptions.awaitPreload
    );

    expect(locationsMatch).toHaveBeenCalledTimes(1);
    expect(locationsMatch).toHaveBeenCalledWith(
      'matchedLocation',
      defaultRouterOptions.history.location,
      true
    );

    expect(defaultRouterOptions.history.replace).not.toHaveBeenCalled();
    expect(defaultRouterOptions.history.listen).toHaveBeenCalledTimes(1);
    expect(defaultRouterOptions.history.listen).toHaveBeenCalledWith(
      expect.any(Function)
    );
  });

  it('should call history.replace when locationsMatch returns false', () => {
    mockLocationsMatch.mockReturnValueOnce(false);

    createRouter(defaultRouterOptions);

    expect(defaultRouterOptions.history.replace).toHaveBeenCalledTimes(1);
    expect(defaultRouterOptions.history.replace).toHaveBeenCalledWith(
      'matchedLocation'
    );
  });

  it('should return the expected router context', () => {
    const router = createRouter(defaultRouterOptions);

    expect(router).toEqual({
      assistPreload: defaultRouterOptions.assistPreload,
      awaitComponent: defaultRouterOptions.awaitComponent,
      get: expect.any(Function),
      getCurrentRouteKey: expect.any(Function),
      history: {
        ...defaultRouterOptions.history,
        // These functions explicitly expect any function because of issue:
        // https://github.com/erictaylor/yarr/issues/4
        push: expect.any(Function),
        replace: expect.any(Function),
      },
      isActive: expect.any(Function),
      logger: expect.any(Function),
      preloadCode: expect.any(Function),
      routeTransitionCompleted: expect.any(Function),
      subscribe: expect.any(Function),
      warmRoute: expect.any(Function),
    });
  });

  it('should have expected behavior from returned `get` function', () => {
    const router = createRouter(defaultRouterOptions);

    expect(router.get()).toEqual({
      component: { load: expect.any(Function) },
      location: 'preparedLocation',
    });
  });

  it('should have expected behavior from returned `isActive` function', () => {
    const router = createRouter(defaultRouterOptions);

    mockLocationsMatch.mockClear();
    router.isActive('foo');
    expect(locationsMatch).toHaveBeenCalledTimes(1);
    expect(locationsMatch).toHaveBeenCalledWith(
      defaultRouterOptions.history.location,
      'foo',
      undefined
    );

    router.isActive('bar', false);
    expect(locationsMatch).toHaveBeenCalledTimes(2);
    expect(locationsMatch).toHaveBeenCalledWith(
      defaultRouterOptions.history.location,
      'bar',
      false
    );

    router.isActive('baz', true);
    expect(locationsMatch).toHaveBeenCalledTimes(3);
    expect(locationsMatch).toHaveBeenCalledWith(
      defaultRouterOptions.history.location,
      'baz',
      true
    );
  });

  it('should have expected behavior from returned `preloadCode` function', () => {
    const router = createRouter(defaultRouterOptions);

    router.preloadCode('baz');

    expect(matchRoutes).toHaveBeenCalledTimes(2);
    expect(matchRoutes).toHaveBeenCalledWith('routesEntryMap', {
      hash: '',
      pathname: 'baz',
      search: '',
    });

    expect(componentLoadMock).toHaveBeenCalledTimes(1);
    expect(componentLoadMock).toHaveBeenCalledWith();
  });

  it('should have expected behavior from returned `subscribe` function', () => {
    const history = createMemoryHistory<State>();
    const router = createRouter({ ...defaultRouterOptions, history });

    const mockSubscribeHistoryFunction = jest.fn();
    const mockSubscribeTransitionFunction = jest.fn();

    mockLocationsMatch.mockReturnValueOnce(false);

    const dispose = router.subscribe({
      onTransitionComplete: mockSubscribeTransitionFunction,
      onTransitionStart: mockSubscribeHistoryFunction,
    });

    expect(dispose).toEqual(expect.any(Function));

    history.push('/testing');

    expect(mockSubscribeHistoryFunction).toHaveBeenCalledTimes(1);
    expect(mockSubscribeHistoryFunction).toHaveBeenCalledWith(
      {
        component: { load: expect.any(Function) },
        location: 'preparedLocation',
      },
      {
        action: 'PUSH',
        location: {
          hash: '',
          key: expect.any(String),
          pathname: '/testing',
          search: '',
          state: undefined,
        },
      }
    );

    expect(mockSubscribeTransitionFunction).not.toHaveBeenCalled();

    router.routeTransitionCompleted({
      action: 'PUSH',
      location: {
        hash: '',
        key: 'testKey',
        pathname: '/testing',
        search: '',
        state: undefined,
      },
    });

    expect(mockSubscribeTransitionFunction).toHaveBeenCalledTimes(1);
    expect(mockSubscribeTransitionFunction).toHaveBeenCalledWith({
      action: 'PUSH',
      location: {
        hash: '',
        key: 'testKey',
        pathname: '/testing',
        search: '',
        state: undefined,
      },
    });

    dispose();

    mockSubscribeHistoryFunction.mockClear();
    mockLocationsMatch.mockReturnValueOnce(false);

    history.push('/testing2');

    expect(mockSubscribeHistoryFunction).not.toHaveBeenCalled();
  });

  it('should have expected behavior from returned `warmRoute` function', () => {
    const router = createRouter(defaultRouterOptions);

    mockPrepareMatch.mockClear();

    router.warmRoute('testWarmRoute');

    expect(matchRoutes).toHaveBeenCalledTimes(2);
    expect(matchRoutes).toHaveBeenCalledWith('routesEntryMap', {
      hash: '',
      pathname: 'testWarmRoute',
      search: '',
    });

    expect(prepareMatch).toHaveBeenCalledTimes(1);
    expect(prepareMatch).toHaveBeenCalledWith(
      {
        location: 'matchedLocation',
        route: { component: { load: expect.any(Function) } },
      },
      defaultRouterOptions.assistPreload,
      defaultRouterOptions.awaitPreload
    );
  });

  describe('history listener logic', () => {
    it('should do nothing when locationsMatch returns true', () => {
      const history = createMemoryHistory<State>();
      jest.spyOn(history, 'replace');

      const router = createRouter({ ...defaultRouterOptions, history });

      const mockSubscribeFunction = jest.fn();

      router.subscribe({ onTransitionStart: mockSubscribeFunction });

      history.push('/firstLocation');

      expect(locationsMatch).toHaveBeenCalledTimes(2);
      expect(locationsMatch).toHaveBeenCalledWith(
        'preparedLocation',
        {
          hash: '',
          key: expect.any(String),
          pathname: '/firstLocation',
          search: '',
          state: undefined,
        },
        true
      );

      expect(matchRoutes).toHaveBeenCalledTimes(1);
      expect(prepareMatch).toHaveBeenCalledTimes(1);

      expect(history.replace).not.toHaveBeenCalled();
      expect(mockSubscribeFunction).not.toHaveBeenCalled();
    });

    it('should act as expected when first locationsMatch returns false (new location)', () => {
      const history = createMemoryHistory<State>();
      jest.spyOn(history, 'replace');

      const router = createRouter({ ...defaultRouterOptions, history });

      const mockSubscribeFunction = jest.fn();
      router.subscribe({ onTransitionStart: mockSubscribeFunction });

      mockLocationsMatch.mockReturnValueOnce(false);

      history.push('/newLocation');

      expect(locationsMatch).toHaveBeenCalledTimes(3);
      expect(locationsMatch).toHaveBeenNthCalledWith(
        2,
        'preparedLocation',
        {
          hash: '',
          key: expect.any(String),
          pathname: '/newLocation',
          search: '',
          state: undefined,
        },
        true
      );

      expect(matchRoutes).toHaveBeenCalledTimes(2);
      expect(matchRoutes).toHaveBeenCalledWith('routesEntryMap', {
        hash: '',
        key: expect.any(String),
        pathname: '/newLocation',
        search: '',
        state: undefined,
      });

      expect(prepareMatch).toHaveBeenCalledTimes(2);
      expect(prepareMatch).toHaveBeenCalledWith(
        {
          location: 'matchedLocation',
          route: { component: { load: expect.any(Function) } },
        },
        defaultRouterOptions.assistPreload,
        defaultRouterOptions.awaitPreload
      );

      expect(history.replace).not.toHaveBeenCalled();

      expect(mockSubscribeFunction).toHaveBeenCalledTimes(1);
      expect(mockSubscribeFunction).toHaveBeenCalledWith(
        {
          component: { load: expect.any(Function) },
          location: 'preparedLocation',
        },
        {
          action: 'PUSH',
          location: {
            hash: '',
            key: expect.any(String),
            pathname: '/newLocation',
            search: '',
            state: undefined,
          },
        }
      );
    });

    it('should act as expected when second locationsMatch returns false (replaced location)', () => {
      const history = createMemoryHistory<State>();
      jest.spyOn(history, 'replace');

      const router = createRouter({ ...defaultRouterOptions, history });

      const mockSubscribeFunction = jest.fn();
      router.subscribe({ onTransitionStart: mockSubscribeFunction });

      mockLocationsMatch.mockReturnValueOnce(false).mockReturnValueOnce(false);
      expect(locationsMatch).toHaveBeenCalledTimes(1);

      history.push('/newLocation');

      // First time is init check pre history.listen calls (return is true)
      // Second time is first call in history.listen (return is false)
      // Third time is second call in history.listen (return is false)
      // This means history.replace is called, which calls history.location again
      // So we get our last call to locationsMatch in history.listen (return is true)
      expect(locationsMatch).toHaveBeenCalledTimes(4);

      expect(matchRoutes).toHaveBeenCalledTimes(2);

      expect(prepareMatch).toHaveBeenCalledTimes(2);

      expect(history.replace).toHaveBeenCalledTimes(1);
      expect(history.replace).toHaveBeenCalledWith('matchedLocation');

      expect(mockSubscribeFunction).not.toHaveBeenCalled();
    });

    it('should update the currentEntry with a new location', () => {
      const history = createMemoryHistory<State>();
      const router = createRouter({ ...defaultRouterOptions, history });

      expect(router.get()).toEqual({
        component: { load: expect.any(Function) },
        location: 'preparedLocation',
      });

      mockLocationsMatch.mockReturnValueOnce(false);
      mockPrepareMatch.mockReturnValueOnce({
        component: { load: jest.fn() },
        location: 'newLocation',
      });

      history.push('newLocation');

      expect(router.get()).toEqual({
        component: { load: expect.any(Function) },
        location: 'newLocation',
      });
    });

    it('should notify all subscribers of changes', () => {
      const history = createMemoryHistory<State>();
      const router = createRouter({ ...defaultRouterOptions, history });

      const firstHistorySubscriber = jest.fn();
      const secondHistorySubscriber = jest.fn();
      const thirdHistorySubscriber = jest.fn();

      const firstTransitionSubscriber = jest.fn();
      const secondTransitionSubscriber = jest.fn();
      const thirdTransitionSubscriber = jest.fn();

      router.subscribe({
        onTransitionComplete: firstTransitionSubscriber,
        onTransitionStart: firstHistorySubscriber,
      });
      router.subscribe({
        onTransitionComplete: secondTransitionSubscriber,
        onTransitionStart: secondHistorySubscriber,
      });
      router.subscribe({
        onTransitionComplete: thirdTransitionSubscriber,
        onTransitionStart: thirdHistorySubscriber,
      });

      mockLocationsMatch.mockReturnValueOnce(false);

      history.push('newLocation');

      expect(firstHistorySubscriber).toHaveBeenCalledTimes(1);
      expect(firstHistorySubscriber).toHaveBeenCalledWith(
        {
          component: { load: expect.any(Function) },
          location: 'preparedLocation',
        },
        {
          action: 'PUSH',
          location: {
            hash: '',
            key: expect.any(String),
            pathname: '/newLocation',
            search: '',
            state: undefined,
          },
        }
      );
      expect(firstTransitionSubscriber).not.toHaveBeenCalled();

      expect(secondHistorySubscriber).toHaveBeenCalledTimes(1);
      expect(secondHistorySubscriber).toHaveBeenCalledWith(
        {
          component: { load: expect.any(Function) },
          location: 'preparedLocation',
        },
        {
          action: 'PUSH',
          location: {
            hash: '',
            key: expect.any(String),
            pathname: '/newLocation',
            search: '',
            state: undefined,
          },
        }
      );
      expect(firstTransitionSubscriber).not.toHaveBeenCalled();

      expect(thirdHistorySubscriber).toHaveBeenCalledTimes(1);
      expect(thirdHistorySubscriber).toHaveBeenCalledWith(
        {
          component: { load: expect.any(Function) },
          location: 'preparedLocation',
        },
        {
          action: 'PUSH',
          location: {
            hash: '',
            key: expect.any(String),
            pathname: '/newLocation',
            search: '',
            state: undefined,
          },
        }
      );
      expect(firstTransitionSubscriber).not.toHaveBeenCalled();

      router.routeTransitionCompleted({
        action: 'PUSH',
        location: {
          hash: '',
          key: 'newKey',
          pathname: 'newLocation',
          search: '',
          state: undefined,
        },
      });

      expect(firstTransitionSubscriber).toHaveBeenCalledTimes(1);
      expect(firstTransitionSubscriber).toHaveBeenCalledWith({
        action: 'PUSH',
        location: {
          hash: '',
          key: 'newKey',
          pathname: 'newLocation',
          search: '',
          state: undefined,
        },
      });

      expect(secondTransitionSubscriber).toHaveBeenCalledTimes(1);
      expect(secondTransitionSubscriber).toHaveBeenCalledWith({
        action: 'PUSH',
        location: {
          hash: '',
          key: 'newKey',
          pathname: 'newLocation',
          search: '',
          state: undefined,
        },
      });

      expect(thirdTransitionSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdTransitionSubscriber).toHaveBeenCalledWith({
        action: 'PUSH',
        location: {
          hash: '',
          key: 'newKey',
          pathname: 'newLocation',
          search: '',
          state: undefined,
        },
      });
    });
  });
});
