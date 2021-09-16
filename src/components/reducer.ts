import type { PreparedRouteEntry, Update } from '../types';

export interface RouteRendererState {
  historyUpdate: Update;
  isPendingTransition: boolean;
  routeEntry: PreparedRouteEntry;
}

type RouteRendererAction =
  | {
      payload: {
        historyUpdate: Update;
        routeEntry: PreparedRouteEntry;
      };
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
        isPendingTransition: true,
      };
    }
    case 'FINISH_ROUTE_TRANSITION': {
      return {
        ...state,
        isPendingTransition: false,
        ...action.payload,
      };
    }
    default: {
      return state;
    }
  }
};
