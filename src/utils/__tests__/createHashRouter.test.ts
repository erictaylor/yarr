import { createHashHistory } from 'history';
import type { RoutesConfig } from '../../types';
import { createHashRouter } from '../createHashRouter';
import { createRouter } from '../createRouter';

jest.mock('history', () => ({
  createHashHistory: jest.fn(() => ({
    type: 'HashHistory',
  })),
}));
jest.mock('../createRouter');

describe('createHashRouter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws when called with no arguments', () => {
    expect(() => {
      // @ts-expect-error - Verifying throw of invalid arguments.
      createHashRouter();
    }).toThrow();
  });

  it('calls createHashHistory with history options, and createRouter with routes and history', () => {
    const routes = [{}];
    createHashRouter(
      {
        assistPreload: false,
        awaitComponent: false,
        awaitPreload: false,
        routes: routes as unknown as RoutesConfig,
      },
      { basename: '/' }
    );

    expect(createHashHistory).toHaveBeenCalledTimes(1);
    expect(createHashHistory).toHaveBeenCalledWith({ basename: '/' });
    expect(createRouter).toHaveBeenCalledTimes(1);
    expect(createRouter).toHaveBeenCalledWith({
      assistPreload: false,
      awaitComponent: false,
      awaitPreload: false,
      history: {
        type: 'HashHistory',
      },
      routes,
    });
  });
});
