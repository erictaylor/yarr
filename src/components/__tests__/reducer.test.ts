import type { PreparedRouteEntry } from '../../types';
import type { RouteRendererState } from '../reducer';
import { reducer } from '../reducer';

const initialState: RouteRendererState = {
  historyUpdate: {
    action: 'POP',
    location: {
      hash: '',
      key: 'initialKey',
      pathname: '/',
      search: '',
      state: null,
    },
  },
  isPendingTransition: false,
  routeEntry: {} as PreparedRouteEntry,
};

describe('reducer', () => {
  it('should return the correct state for START_ROUTE_TRANSITION action', () => {
    expect(reducer(initialState, { type: 'START_ROUTE_TRANSITION' })).toEqual({
      ...initialState,
      isPendingTransition: true,
    });
  });

  it('should return the correct state for FINISH_ROUTE_TRANSITION action', () => {
    const newRoute = {} as PreparedRouteEntry;

    expect(
      reducer(
        { ...initialState, isPendingTransition: true },
        {
          payload: {
            historyUpdate: {
              action: 'PUSH',
              location: {
                hash: '#test',
                key: 'newKey',
                pathname: '/newPath',
                search: '?test=abc',
                state: null,
              },
            },
            routeEntry: newRoute,
          },
          type: 'FINISH_ROUTE_TRANSITION',
        }
      )
    ).toEqual({
      ...initialState,
      historyUpdate: {
        action: 'PUSH',
        location: {
          hash: '#test',
          key: 'newKey',
          pathname: '/newPath',
          search: '?test=abc',
          state: null,
        },
      },
      isPendingTransition: false,
      routeEntry: newRoute,
    });
  });
});
