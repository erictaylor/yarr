import { createHashHistory } from 'history';
import { createRouter } from '../createRouter';
import { createHashRouter } from '../createHashRouter';

jest.mock('history', () => ({
  createHashHistory: jest.fn(() => 'HashHistory'),
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
    const routes = [{}, {}];
    createHashRouter(routes, { window: ('iframe' as unknown) as Window });

    expect(createHashHistory).toHaveBeenCalledTimes(1);
    expect(createHashHistory).toHaveBeenCalledWith({ window: 'iframe' });
    expect(createRouter).toHaveBeenCalledTimes(1);
    expect(createRouter).toHaveBeenCalledWith({
      history: 'HashHistory',
      routes,
    });
  });
});
