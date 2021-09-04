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
      {
        window: 'iframe' as unknown as Window,
      }
    );

    expect(createHashHistory).toHaveBeenCalledTimes(1);
    expect(createHashHistory).toHaveBeenCalledWith({ window: 'iframe' });
    expect(createRouter).toHaveBeenCalledTimes(1);
    expect(createRouter).toHaveBeenCalledWith({
      assistPreload: false,
      awaitComponent: false,
      awaitPreload: false,
      history: {
        // These are here because of the overwritten fix being applied.
        createHref: expect.any(Function),
        push: expect.any(Function),
        replace: expect.any(Function),
        type: 'HashHistory',
      },
      routes,
    });
  });
});
