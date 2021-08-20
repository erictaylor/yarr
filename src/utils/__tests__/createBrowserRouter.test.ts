import { createBrowserHistory } from 'history';
import type { RoutesConfig } from '../../types';
import { createBrowserRouter } from '../createBrowserRouter';
import { createRouter } from '../createRouter';

jest.mock('history', () => ({
  createBrowserHistory: jest.fn(() => 'BrowserHistory'),
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
    createBrowserRouter(routes as unknown as RoutesConfig, {
      window: 'iframe' as unknown as Window,
    });

    expect(createBrowserHistory).toHaveBeenCalledTimes(1);
    expect(createBrowserHistory).toHaveBeenCalledWith({ window: 'iframe' });
    expect(createRouter).toHaveBeenCalledTimes(1);
    expect(createRouter).toHaveBeenCalledWith({
      history: 'BrowserHistory',
      routes,
    });
  });
});
