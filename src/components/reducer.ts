import type { PreparedRouteEntry } from '../types';

export interface RouteRendererState {
  isTransitioning: boolean;
  routeEntry: PreparedRouteEntry;
}

type RouteRendererAction =
  | {
      payload: PreparedRouteEntry;
      type: 'FINISH_ROUTE_TRANSITION';
    }
  | { type: 'START_ROUTE_TRANSITION' };

export const reducer = (
  state: RouteRendererState,
  action: RouteRendererAction
) => {
  switch (action.type) {
    case 'START_ROUTE_TRANSITION': {
      return {
        ...state,
        isTransitioning: true,
      };
    }
    case 'FINISH_ROUTE_TRANSITION': {
      return {
        ...state,
        isTransitioning: false,
        routeEntry: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};
