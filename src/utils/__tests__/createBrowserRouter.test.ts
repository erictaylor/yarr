import { createBrowserHistory } from 'history';
import type { RoutesConfig } from '../../types';
import { createBrowserRouter } from '../createBrowserRouter';
import { createRouter } from '../createRouter';

jest.mock('history', () => ({
  createBrowserHistory: jest.fn(() => ({ type: 'BrowserHistory' })),
}));
jest.mock('../createRouter');

describe('createBrowserRouter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws when called with no arguments', () => {
    expect(() => {
      // @ts-expect-error - Verifying throw of invalid arguments.
      createBrowserRouter();
    }).toThrow();
  });

  it('calls createBrowserHistory with history options, and createRouter with routes and history', () => {
    const routes = [{}];
    createBrowserRouter(
      {
        assistPreload: false,
        awaitComponent: false,
        awaitPreload: false,
        routes: routes as unknown as RoutesConfig,
      },
      { basename: '/' }
    );

    expect(createBrowserHistory).toHaveBeenCalledTimes(1);
    expect(createBrowserHistory).toHaveBeenCalledWith({ basename: '/' });
    expect(createRouter).toHaveBeenCalledTimes(1);
    expect(createRouter).toHaveBeenCalledWith({
      assistPreload: false,
      awaitComponent: false,
      awaitPreload: false,
      history: {
        type: 'BrowserHistory',
      },
      routes,
    });
  });
});
