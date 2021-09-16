import { render, screen } from '@testing-library/react';
import { RouterContext } from '../../context/RouterContext';
import type { RouterProps } from '../../types';
import { RouterProvider } from '../RouterProvider';
import '@testing-library/jest-dom';

describe('<RouterProvider />', () => {
  it('should render children with access to router context', () => {
    const router = { mockedRouter: 'mockedRouter' } as unknown as RouterProps;

    render(
      <RouterProvider router={router}>
        <RouterContext.Consumer>
          {(value) => <div>{JSON.stringify(value)}</div>}
        </RouterContext.Consumer>
      </RouterProvider>
    );

    expect(
      screen.getByText(
        JSON.stringify({ ...router, rendererInitialized: false })
      )
    ).toBeInTheDocument();
  });
});
