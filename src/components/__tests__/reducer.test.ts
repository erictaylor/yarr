import type { PreparedRouteEntry } from '../../types';
import type { RouteRendererState } from '../reducer';
import { reducer } from '../reducer';

const initialState: RouteRendererState = {
  isTransitioning: false,
  routeEntry: {} as PreparedRouteEntry,
};

describe('reducer', () => {
  it('should return the correct state for START_ROUTE_TRANSITION action', () => {
    expect(reducer(initialState, { type: 'START_ROUTE_TRANSITION' })).toEqual({
      ...initialState,
      isTransitioning: true,
    });
  });

  it('should return the correct state for FINISH_ROUTE_TRANSITION action', () => {
    const newRoute = {} as PreparedRouteEntry;

    expect(
      reducer(
        { ...initialState, isTransitioning: true },
        {
          payload: newRoute,
          type: 'FINISH_ROUTE_TRANSITION',
        }
      )
    ).toEqual({
      ...initialState,
      isTransitioning: false,
      routeEntry: newRoute,
    });
  });
});
