import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { launchWorkspace2 } from '@openmrs/esm-framework';
import Header from './header.component';

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  launchWorkspace2: jest.fn(),
  PageHeader: ({ children, className }: any) => <header className={className}>{children}</header>,
  PageHeaderContent: ({ title, illustration }: any) => (
    <div>
      {illustration}
      <h1>{title}</h1>
    </div>
  ),
  PatientListsPictogram: () => <svg data-testid="patient-lists-icon" />,
}));

const mockLaunchWorkspace2 = jest.mocked(launchWorkspace2);

describe('Header Component - Workspace V2 Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the header with title and new list button', () => {
    render(<Header />);

    expect(screen.getByText(/patient lists/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new list/i })).toBeInTheDocument();
    expect(screen.getByTestId('patient-lists-icon')).toBeInTheDocument();
  });

  it('launches workspace v2 when new list button is clicked', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const newListButton = screen.getByRole('button', { name: /new list/i });
    await user.click(newListButton);

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace', {
      onSuccess: undefined,
    });
  });

  it('passes onCreateSuccess callback to workspace props', async () => {
    const user = userEvent.setup();
    const mockOnCreateSuccess = jest.fn();

    render(<Header onCreateSuccess={mockOnCreateSuccess} />);

    const newListButton = screen.getByRole('button', { name: /new list/i });
    await user.click(newListButton);

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace', {
      onSuccess: mockOnCreateSuccess,
    });
  });

  it('launches correct workspace name for v2 API', async () => {
    const user = userEvent.setup();
    render(<Header />);

    const newListButton = screen.getByRole('button', { name: /new list/i });
    await user.click(newListButton);

    // Verify the correct workspace name is used
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace', expect.any(Object));
  });

  it('button has correct role and accessibility attributes', () => {
    render(<Header />);

    const newListButton = screen.getByRole('button', { name: /new list/i });
    expect(newListButton).toHaveAttribute('data-openmrs-role', 'New List');
  });
});

describe('Header Workspace V2 Props', () => {
  it('workspace is launched with correct structure for creating new list', async () => {
    const user = userEvent.setup();
    render(<Header />);

    await user.click(screen.getByRole('button', { name: /new list/i }));

    // Verify launchWorkspace2 was called (v2 API)
    expect(mockLaunchWorkspace2).toHaveBeenCalledTimes(1);

    // Verify workspace name follows v2 naming convention
    const [workspaceName] = mockLaunchWorkspace2.mock.calls[0];
    expect(workspaceName).toBe('patient-list-form-workspace');
  });
});
