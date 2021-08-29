import { Action, createMemoryHistory } from 'history';
import type { CreateRouterOptions, RoutesConfig } from '../../types';
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
      action: Action.Push,
      back: jest.fn(),
      block: jest.fn(),
      createHref: jest.fn(),
      forward: jest.fn(),
      go: jest.fn(),
      listen: jest.fn(),
      location: {
        hash: '',
        key: 'historyKey',
        pathname: 'historyLocation',
        search: '',
        state: null,
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
      history: defaultRouterOptions.history,
      isActive: expect.any(Function),
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
    expect(matchRoutes).toHaveBeenCalledWith('routesEntryMap', 'baz');

    expect(componentLoadMock).toHaveBeenCalledTimes(1);
    expect(componentLoadMock).toHaveBeenCalledWith();
  });

  it('should have expected behavior from returned `subscribe` function', () => {
    const history = createMemoryHistory();
    const router = createRouter({ ...defaultRouterOptions, history });

    const mockSubscribeHistoryFunction = jest.fn();
    const mockSubscribeTransitionFunction = jest.fn();

    mockLocationsMatch.mockReturnValueOnce(false);

    const dispose = router.subscribe(
      mockSubscribeHistoryFunction,
      mockSubscribeTransitionFunction
    );

    expect(dispose).toEqual(expect.any(Function));

    history.push('/testing');

    expect(mockSubscribeHistoryFunction).toHaveBeenCalledTimes(1);
    expect(mockSubscribeHistoryFunction).toHaveBeenCalledWith({
      component: { load: expect.any(Function) },
      location: 'preparedLocation',
    });

    expect(mockSubscribeTransitionFunction).not.toHaveBeenCalled();

    router.routeTransitionCompleted({
      hash: '',
      pathname: '/testing',
      search: '',
    });

    expect(mockSubscribeTransitionFunction).toHaveBeenCalledTimes(1);
    expect(mockSubscribeTransitionFunction).toHaveBeenCalledWith({
      hash: '',
      pathname: '/testing',
      search: '',
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
    expect(matchRoutes).toHaveBeenCalledWith('routesEntryMap', 'testWarmRoute');

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
      const history = createMemoryHistory();
      jest.spyOn(history, 'replace');

      const router = createRouter({ ...defaultRouterOptions, history });

      const mockSubscribeFunction = jest.fn();

      router.subscribe(mockSubscribeFunction);

      history.push('/firstLocation');

      expect(locationsMatch).toHaveBeenCalledTimes(2);
      expect(locationsMatch).toHaveBeenCalledWith(
        'preparedLocation',
        {
          hash: '',
          key: expect.any(String),
          pathname: '/firstLocation',
          search: '',
          state: null,
        },
        true
      );

      expect(matchRoutes).toHaveBeenCalledTimes(1);
      expect(prepareMatch).toHaveBeenCalledTimes(1);

      expect(history.replace).not.toHaveBeenCalled();
      expect(mockSubscribeFunction).not.toHaveBeenCalled();
    });

    it('should act as expected when first locationsMatch returns false (new location)', () => {
      const history = createMemoryHistory();
      jest.spyOn(history, 'replace');

      const router = createRouter({ ...defaultRouterOptions, history });

      const mockSubscribeFunction = jest.fn();
      router.subscribe(mockSubscribeFunction);

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
          state: null,
        },
        true
      );

      expect(matchRoutes).toHaveBeenCalledTimes(2);
      expect(matchRoutes).toHaveBeenCalledWith('routesEntryMap', {
        hash: '',
        key: expect.any(String),
        pathname: '/newLocation',
        search: '',
        state: null,
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
      expect(mockSubscribeFunction).toHaveBeenCalledWith({
        component: { load: expect.any(Function) },
        location: 'preparedLocation',
      });
    });

    it('should act as expected when second locationsMatch returns false (replaced location)', () => {
      const history = createMemoryHistory();
      jest.spyOn(history, 'replace');

      const router = createRouter({ ...defaultRouterOptions, history });

      const mockSubscribeFunction = jest.fn();
      router.subscribe(mockSubscribeFunction);

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
      const history = createMemoryHistory();
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
      const history = createMemoryHistory();
      const router = createRouter({ ...defaultRouterOptions, history });

      const firstHistorySubscriber = jest.fn();
      const secondHistorySubscriber = jest.fn();
      const thirdHistorySubscriber = jest.fn();

      const firstTransitionSubscriber = jest.fn();
      const secondTransitionSubscriber = jest.fn();
      const thirdTransitionSubscriber = jest.fn();

      router.subscribe(firstHistorySubscriber, firstTransitionSubscriber);
      router.subscribe(secondHistorySubscriber, secondTransitionSubscriber);
      router.subscribe(thirdHistorySubscriber, thirdTransitionSubscriber);

      mockLocationsMatch.mockReturnValueOnce(false);

      history.push('newLocation');

      expect(firstHistorySubscriber).toHaveBeenCalledTimes(1);
      expect(firstHistorySubscriber).toHaveBeenCalledWith({
        component: { load: expect.any(Function) },
        location: 'preparedLocation',
      });
      expect(firstTransitionSubscriber).not.toHaveBeenCalled();

      expect(secondHistorySubscriber).toHaveBeenCalledTimes(1);
      expect(secondHistorySubscriber).toHaveBeenCalledWith({
        component: { load: expect.any(Function) },
        location: 'preparedLocation',
      });
      expect(firstTransitionSubscriber).not.toHaveBeenCalled();

      expect(thirdHistorySubscriber).toHaveBeenCalledTimes(1);
      expect(thirdHistorySubscriber).toHaveBeenCalledWith({
        component: { load: expect.any(Function) },
        location: 'preparedLocation',
      });
      expect(firstTransitionSubscriber).not.toHaveBeenCalled();

      router.routeTransitionCompleted({
        hash: '',
        pathname: 'newLocation',
        search: '',
      });

      expect(firstTransitionSubscriber).toHaveBeenCalledTimes(1);
      expect(firstTransitionSubscriber).toHaveBeenCalledWith({
        hash: '',
        pathname: 'newLocation',
        search: '',
      });

      expect(secondTransitionSubscriber).toHaveBeenCalledTimes(1);
      expect(secondTransitionSubscriber).toHaveBeenCalledWith({
        hash: '',
        pathname: 'newLocation',
        search: '',
      });

      expect(thirdTransitionSubscriber).toHaveBeenCalledTimes(1);
      expect(thirdTransitionSubscriber).toHaveBeenCalledWith({
        hash: '',
        pathname: 'newLocation',
        search: '',
      });
    });
  });
});
