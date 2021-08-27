import { render, screen } from '@testing-library/react';
import { RouterContext } from '../../context/RouterContext';
import type { RouterContextProps } from '../../types';
import { RouterProvider } from '../RouterProvider';
import '@testing-library/jest-dom';

describe('<RouterProvider />', () => {
  it('should render children with access to router context', () => {
    const router = 'mockedRouter' as unknown as RouterContextProps;

    render(
      <RouterProvider router={router}>
        <RouterContext.Consumer>
          {(value) => <div>{value}</div>}
        </RouterContext.Consumer>
      </RouterProvider>
    );

    expect(screen.getByText('mockedRouter')).toBeInTheDocument();
  });
});
