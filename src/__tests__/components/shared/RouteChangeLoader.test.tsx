import React from 'react';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RouteChangeLoader from '@/components/shared/RouteChangeLoader';

describe('RouteChangeLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('shows loader when navigation starts', () => {
    jest.spyOn(React, 'useState').mockReturnValueOnce([true, jest.fn()]);

    render(<RouteChangeLoader />);

    expect(screen.getByText('Loading your page…')).toBeInTheDocument();
  });

  it('does not show loader for same route or opt-out links', () => {
    render(<RouteChangeLoader />);

    const sameRoute = document.createElement('a');
    sameRoute.href = '/';
    sameRoute.textContent = 'Home';
    sameRoute.addEventListener('click', (event) => event.preventDefault());
    document.body.appendChild(sameRoute);

    fireEvent.click(sameRoute);
    expect(screen.queryByText('Loading your page…')).not.toBeInTheDocument();

    const optOut = document.createElement('a');
    optOut.href = '/dashboard';
    optOut.textContent = 'Dashboard';
    optOut.dataset.noLoading = 'true';
    optOut.addEventListener('click', (event) => event.preventDefault());
    document.body.appendChild(optOut);

    fireEvent.click(optOut);
    expect(screen.queryByText('Loading your page…')).not.toBeInTheDocument();

    document.body.removeChild(sameRoute);
    document.body.removeChild(optOut);
  });
});
