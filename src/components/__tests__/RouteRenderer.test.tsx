import { act, render, screen, waitFor } from '@testing-library/react';
import { Action } from 'history';
import { Suspense } from 'react';
import { RouterContext } from '../../context/RouterContext';
import type {
  PreparedEntryWithAssist,
  PreparedEntryWithoutAssist,
  PreparedRouteEntryProps,
  RouterContextProps,
} from '../../types';
import { SuspenseResource } from '../../utils/SuspenseResource';
import { RouteRenderer } from '../RouteRenderer';
import '@testing-library/jest-dom';

const initialEntry = {
  component: {
    read: jest
      .fn()
      .mockImplementation(
        () =>
          ({ preloaded, params, search }: PreparedRouteEntryProps) =>
            (
              <div>
                <h1>Initial route</h1>
                <pre data-testid="preloaded">{JSON.stringify(preloaded)}</pre>
                <pre data-testid="params">{JSON.stringify(params)}</pre>
                <pre data-testid="search">{JSON.stringify(search)}</pre>
              </div>
            )
      ),
  },
  params: { baz: 'qux' },
  preloaded: { foo: 'bar' },
  search: { abc: '123' },
};

const assistPreloadInitialEntry = {
  ...initialEntry,
  preloaded: new Map([['assistFoo', { data: 'assistBar', defer: true }]]),
} as unknown as PreparedEntryWithAssist;

const newRouteEntry = {
  component: {
    read: jest
      .fn()
      .mockImplementation(
        () =>
          ({ preloaded, params, search }: PreparedRouteEntryProps) =>
            (
              <div>
                <h1>New route</h1>
                <pre data-testid="preloaded">{JSON.stringify(preloaded)}</pre>
                <pre data-testid="params">{JSON.stringify(params)}</pre>
                <pre data-testid="search">{JSON.stringify(search)}</pre>
              </div>
            )
      ),
  },
  params: { user: 'eric' },
  preloaded: { color: 'blue' },
  search: {},
};

const mockRouterDispose = jest.fn();
const mockRouterGet = jest.fn().mockImplementation(() => initialEntry);
const mockRouterSubscribe = jest
  .fn()
  .mockImplementation(() => mockRouterDispose);
const mockRouteTransitionCompleted = jest.fn();

const mockRouter: RouterContextProps = {
  assistPreload: false,
  awaitComponent: false,
  get: mockRouterGet,
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
  isActive: jest.fn(),
  preloadCode: jest.fn(),
  routeTransitionCompleted: mockRouteTransitionCompleted,
  subscribe: mockRouterSubscribe,
  warmRoute: jest.fn(),
};

const PendingIndicator = () => <div>Pending indicator...</div>;

const renderRouteRenderer = (routerProps?: Partial<RouterContextProps>) => {
  return render(
    <RouterContext.Provider value={{ ...mockRouter, ...routerProps }}>
      <Suspense fallback="Suspense fallback...">
        <RouteRenderer pendingIndicator={<PendingIndicator />} />
      </Suspense>
    </RouterContext.Provider>
  );
};

describe('<RouteRenderer />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render the initial route entry component from get()', () => {
    renderRouteRenderer();

    expect(mockRouterGet).toHaveBeenCalledTimes(1);
    expect(initialEntry.component.read).toHaveBeenCalledTimes(1);
    expect(mockRouterSubscribe).toHaveBeenCalledTimes(1);

    expect(
      screen.getByRole('heading', { name: /initial route/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('preloaded')).toHaveTextContent(
      JSON.stringify(initialEntry.preloaded)
    );
    expect(screen.getByTestId('params')).toHaveTextContent(
      JSON.stringify(initialEntry.params)
    );
    expect(screen.getByTestId('search')).toHaveTextContent(
      JSON.stringify(initialEntry.search)
    );
  });

  it('should re-map `preloaded` props when `assistPreload`', () => {
    renderRouteRenderer({
      assistPreload: true,
      get: () => assistPreloadInitialEntry,
    });

    expect(screen.getByTestId('preloaded')).toHaveTextContent(
      '{"assistFoo":"assistBar"}'
    );
  });

  it('should suspend component while resource is resolving', async () => {
    expect.hasAssertions();

    const componentResource = new SuspenseResource(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(() => <div>Hello world</div>), 100);
      });
    });

    renderRouteRenderer({
      get: () =>
        ({ component: componentResource } as PreparedEntryWithoutAssist),
    });

    expect(screen.getByText('Suspense fallback...')).toBeInTheDocument();
    expect(screen.queryByText('Hello world')).not.toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.queryByText('Suspense fallback...')
      ).not.toBeInTheDocument();
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });
  });

  it('should render new entry immediately when resource already loaded', async () => {
    expect.hasAssertions();

    renderRouteRenderer();

    expect(
      screen.getByRole('heading', { name: /initial route/i })
    ).toBeInTheDocument();

    await act(async () => {
      mockRouterSubscribe.mock.calls[0][0](newRouteEntry);
    });

    expect(screen.queryByText('Pending indicator...')).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /new route/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('preloaded')).toHaveTextContent(
      JSON.stringify(newRouteEntry.preloaded)
    );
    expect(screen.getByTestId('params')).toHaveTextContent(
      JSON.stringify(newRouteEntry.params)
    );
    expect(screen.getByTestId('search')).toHaveTextContent(
      JSON.stringify(newRouteEntry.search)
    );
  });

  it('should re-map `preloaded` prop on next entry on subscription when `assistPreload` mode', async () => {
    expect.hasAssertions();

    const newRouteEntryWithAssistPreload = {
      ...newRouteEntry,
      preloaded: new Map([
        ['assistTest', { data: { fruit: 'apple' }, defer: true }],
      ]),
    };

    renderRouteRenderer({
      assistPreload: true,
      get: () => assistPreloadInitialEntry,
    });

    expect(
      screen.getByRole('heading', { name: /initial route/i })
    ).toBeInTheDocument();

    await act(async () => {
      mockRouterSubscribe.mock.calls[0][0](newRouteEntryWithAssistPreload);
    });

    expect(
      screen.getByRole('heading', { name: /new route/i })
    ).toBeInTheDocument();
    expect(screen.getByTestId('preloaded')).toHaveTextContent(
      '{"fruit":"apple"}'
    );
  });

  it('should dispose router subscription when unmounted', () => {
    const { unmount } = renderRouteRenderer();

    expect(mockRouterDispose).not.toHaveBeenCalled();
    unmount();
    expect(mockRouterDispose).toHaveBeenCalledTimes(1);
  });

  it('should render <PendingIndicator /> and current route while waiting for new route entry to resolve when `awaitComponent` mode', async () => {
    expect.hasAssertions();

    const newComponentResource = new SuspenseResource(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(() => <div>Hello world</div>), 100);
      });
    });

    renderRouteRenderer({
      awaitComponent: true,
    });

    expect(
      screen.getByRole('heading', { name: /initial route/i })
    ).toBeInTheDocument();
    expect(screen.queryByText('Pending indicator...')).not.toBeInTheDocument();
    expect(screen.queryByText('Hello world')).not.toBeInTheDocument();

    await act(async () => {
      mockRouterSubscribe.mock.calls[0][0]({ component: newComponentResource });
    });

    expect(
      screen.getByRole('heading', { hidden: true, name: /initial route/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Pending indicator...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Hello world')).toBeInTheDocument();
    });
  });

  it('should wait for non-deferrable preload resources on new entry when `assistPreload` mode', async () => {
    expect.hasAssertions();

    const testEntry = {
      component: {
        read: jest
          .fn()
          .mockImplementation(
            () =>
              ({
                preloaded,
              }: {
                preloaded: { testData: SuspenseResource<unknown> };
              }) => {
                const testData = preloaded?.testData?.read();

                return (
                  <div>
                    <h1>Test route</h1>
                    <pre data-testid="preloadedData">
                      {JSON.stringify(testData)}
                    </pre>
                  </div>
                );
              }
          ),
      },
      preloaded: new Map([
        [
          'testData',
          {
            data: new SuspenseResource(
              () =>
                new Promise((resolve) => {
                  setTimeout(() => {
                    resolve({ animal: 'cat' });
                  }, 100);
                })
            ),
            defer: false,
          },
        ],
      ]),
    };

    renderRouteRenderer({
      assistPreload: true,
      get: () => assistPreloadInitialEntry,
    });

    expect(
      screen.getByRole('heading', { name: /initial route/i })
    ).toBeInTheDocument();
    expect(screen.queryByText('Pending indicator...')).not.toBeInTheDocument();

    await act(async () => {
      mockRouterSubscribe.mock.calls[0][0](testEntry);
    });

    expect(
      screen.getByRole('heading', { name: /initial route/i })
    ).toBeInTheDocument();
    expect(screen.getByText('Pending indicator...')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /test route/i })
      ).toBeInTheDocument();
      expect(
        screen.queryByText('Pending indicator...')
      ).not.toBeInTheDocument();
      expect(screen.getByTestId('preloadedData')).toHaveTextContent(
        JSON.stringify({ animal: 'cat' })
      );
    });
  });

  it('should call routeTransitionCompleted when new route component is rendered', async () => {
    expect.hasAssertions();
    expect(mockRouteTransitionCompleted).not.toHaveBeenCalled();

    renderRouteRenderer();

    expect(mockRouteTransitionCompleted).toHaveBeenCalledTimes(1);

    await act(async () => {
      mockRouterSubscribe.mock.calls[0][0](newRouteEntry);
    });

    expect(mockRouteTransitionCompleted).toHaveBeenCalledTimes(2);
  });
});
