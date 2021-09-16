import { createMemoryHistory } from 'history';
import type { RoutesConfig } from '../../types';
import { createMemoryRouter } from '../createMemoryRouter';
import { createRouter } from '../createRouter';

jest.mock('history', () => ({
  createMemoryHistory: jest.fn(() => ({
    type: 'MemoryHistory',
  })),
}));
jest.mock('../createRouter');

describe('createMemoryRouter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('throws when called with no arguments', () => {
    expect(() => {
      // @ts-expect-error - Verifying throw of invalid arguments.
      createMemoryRouter();
    }).toThrow();
  });

  it('calls createMemoryHistory with history options, and createRouter with routes and history', () => {
    const routes = [{}];
    createMemoryRouter(
      {
        assistPreload: false,
        awaitComponent: false,
        awaitPreload: false,
        routes: routes as unknown as RoutesConfig,
      },
      {
        initialEntries: ['/'],
        initialIndex: 0,
      }
    );

    expect(createMemoryHistory).toHaveBeenCalledTimes(1);
    expect(createMemoryHistory).toHaveBeenCalledWith({
      initialEntries: ['/'],
      initialIndex: 0,
    });
    expect(createRouter).toHaveBeenCalledTimes(1);
    expect(createRouter).toHaveBeenCalledWith({
      assistPreload: false,
      awaitComponent: false,
      awaitPreload: false,
      history: {
        type: 'MemoryHistory',
      },
      routes,
    });
  });
});
