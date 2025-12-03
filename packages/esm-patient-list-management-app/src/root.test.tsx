import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { launchWorkspace2, WorkspaceContainer } from '@openmrs/esm-framework';
import RootComponent from './root.component';

// Mock react-router-dom
const mockUseSearchParams = jest.fn();
const mockSetSearchParams = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: ({ element }: { element: React.ReactNode }) => <div>{element}</div>,
  useSearchParams: () => [mockUseSearchParams(), mockSetSearchParams],
}));

jest.mock('@openmrs/esm-framework', () => ({
  ...jest.requireActual('@openmrs/esm-framework'),
  launchWorkspace2: jest.fn(),
  WorkspaceContainer: jest.fn(() => <div data-testid="workspace-container" />),
}));

jest.mock('./lists-dashboard/lists-dashboard.component', () => ({
  __esModule: true,
  default: () => <div data-testid="lists-dashboard">Lists Dashboard</div>,
}));

jest.mock('./list-details/list-details.component', () => ({
  __esModule: true,
  default: () => <div data-testid="list-details">List Details</div>,
}));

const mockLaunchWorkspace2 = jest.mocked(launchWorkspace2);
const mockWorkspaceContainer = jest.mocked(WorkspaceContainer);

describe('RootComponent - Workspace V2 Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockUseSearchParams.mockReturnValue({
      has: jest.fn().mockReturnValue(false),
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders the root component with WorkspaceContainer', () => {
    render(<RootComponent />);

    expect(screen.getByTestId('workspace-container')).toBeInTheDocument();
  });

  it('WorkspaceContainer uses correct contextKey', () => {
    render(<RootComponent />);

    expect(mockWorkspaceContainer).toHaveBeenCalledWith(
      expect.objectContaining({
        contextKey: 'patient-lists',
      }),
      expect.anything(),
    );
  });

  it('auto-launches workspace when create query param is present', async () => {
    mockUseSearchParams.mockReturnValue({
      has: jest.fn((param) => param === 'create'),
    });

    render(<RootComponent />);

    // Advance timers for requestAnimationFrame
    jest.runAllTimers();

    await waitFor(() => {
      expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace');
    });
  });

  it('auto-launches workspace when new_cohort query param is present', async () => {
    mockUseSearchParams.mockReturnValue({
      has: jest.fn((param) => param === 'new_cohort'),
    });

    render(<RootComponent />);

    jest.runAllTimers();

    await waitFor(() => {
      expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace');
    });
  });

  it('does not auto-launch workspace when no query params are present', () => {
    mockUseSearchParams.mockReturnValue({
      has: jest.fn().mockReturnValue(false),
    });

    render(<RootComponent />);

    jest.runAllTimers();

    expect(mockLaunchWorkspace2).not.toHaveBeenCalled();
  });

  it('clears search params after launching workspace', async () => {
    mockUseSearchParams.mockReturnValue({
      has: jest.fn((param) => param === 'create'),
    });

    render(<RootComponent />);

    jest.runAllTimers();

    await waitFor(() => {
      expect(mockSetSearchParams).toHaveBeenCalledWith({}, { replace: true });
    });
  });

  it('only launches workspace once even with multiple renders', async () => {
    mockUseSearchParams.mockReturnValue({
      has: jest.fn((param) => param === 'create'),
    });

    const { rerender } = render(<RootComponent />);

    jest.runAllTimers();

    await waitFor(() => {
      expect(mockLaunchWorkspace2).toHaveBeenCalledTimes(1);
    });

    // Re-render should not trigger another launch
    rerender(<RootComponent />);
    jest.runAllTimers();

    expect(mockLaunchWorkspace2).toHaveBeenCalledTimes(1);
  });
});

describe('RootComponent Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseSearchParams.mockReturnValue({
      has: jest.fn().mockReturnValue(false),
    });
  });

  it('renders lists dashboard component', () => {
    render(<RootComponent />);

    expect(screen.getByTestId('lists-dashboard')).toBeInTheDocument();
  });
});

describe('Workspace V2 Auto-Launch Behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('uses requestAnimationFrame for workspace launch timing', async () => {
    const rafSpy = jest.spyOn(window, 'requestAnimationFrame');
    mockUseSearchParams.mockReturnValue({
      has: jest.fn((param) => param === 'create'),
    });

    render(<RootComponent />);

    expect(rafSpy).toHaveBeenCalled();

    rafSpy.mockRestore();
  });

  it('launches workspace v2 with correct workspace name', async () => {
    mockUseSearchParams.mockReturnValue({
      has: jest.fn((param) => param === 'create'),
    });

    render(<RootComponent />);
    jest.runAllTimers();

    await waitFor(() => {
      expect(mockLaunchWorkspace2).toHaveBeenCalledWith('patient-list-form-workspace');
    });

    // Verify it's using v2 API (launchWorkspace2 not launchWorkspace)
    expect(mockLaunchWorkspace2).toHaveBeenCalled();
  });
});
