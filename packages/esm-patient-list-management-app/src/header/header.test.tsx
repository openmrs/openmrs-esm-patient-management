import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import Header from './header.component';

const mockLaunchWorkspace2 = jest.mocked(launchWorkspace2);

describe('Header', () => {
  it('renders the header with title and new list button', () => {
    render(<Header />);

    expect(screen.getByText(/patient lists/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new list/i })).toBeInTheDocument();
  });

  it('launches workspace when new list button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: /new list/i }));

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace', {
      onSuccess: undefined,
    });
  });

  it('passes onCreateSuccess callback to workspace', async () => {
    const user = userEvent.setup();
    const mockOnCreateSuccess = jest.fn();

    render(<Header onCreateSuccess={mockOnCreateSuccess} />);

    await user.click(screen.getByRole('button', { name: /new list/i }));

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace', {
      onSuccess: mockOnCreateSuccess,
    });
  });
});
