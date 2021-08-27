// import { render, screen } from '@testing-library/react';
// import { RouterContext } from '../../context/RouterContext';
// import type { RouterContextProps } from '../../types';
// import { RouteRenderer } from '../RouteRenderer';
import '@testing-library/jest-dom';

describe('<RouteRenderer />', () => {
  it.todo('should render the initial route entry component');

  it.todo('should re-map `preloaded` props when `assistPreload`');

  it.todo('should suspend component while resource is resolving');

  it.todo('should render new entry immediately when resource already loaded');

  it.todo(
    'should re-map `preloaded` prop on next entry on subscription when `assistPreload`'
  );

  it.todo('should dispose router subscription when unmounted');

  it.todo(
    'should render pending indicator and current route while waiting for new route entry to resolve when `awaitComponent`'
  );

  it.todo(
    'should wait for non-deferrable preload resources on new entry when `assistPreload`'
  );
});
