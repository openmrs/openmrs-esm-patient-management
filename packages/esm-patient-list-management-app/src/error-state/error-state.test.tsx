import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ErrorState, type FetchError } from './error-state.component';

describe('ErrorState', () => {
  it('renders FetchError with response status and statusText', () => {
    const error: FetchError = {
      name: 'FetchError',
      message: 'Failed to fetch',
      response: {
        status: 500,
        statusText: 'Internal Server Error',
      },
    };

    render(<ErrorState error={error} headerTitle="Patient Lists" />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Patient Lists');
    expect(screen.getByText(/500: Internal Server Error/)).toBeInTheDocument();
  });

  it('renders standard Error message when response is not present', () => {
    const error = new Error('Network timeout');

    render(<ErrorState error={error} headerTitle="Patient Lists" />);

    expect(screen.getByText(/Network timeout/)).toBeInTheDocument();
  });

  it('renders gracefully when error is null or undefined', () => {
    render(<ErrorState error={null} headerTitle="Patient Lists" />);

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Patient Lists');
  });
});
