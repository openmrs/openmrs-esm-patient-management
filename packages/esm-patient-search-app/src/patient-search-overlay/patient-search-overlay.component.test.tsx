import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PatientSearchOverlay from './patient-search-overlay.component';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, fallback: string) => fallback }),
}));

jest.mock('../ui-components/overlay.component', () => {
  return jest.fn(({ children, header, close }) => (
    <div data-testid="mock-overlay">
      <h2>{header}</h2>
      <button onClick={close} data-testid="close-overlay-btn">
        Close Overlay
      </button>
      <div>{children}</div>
    </div>
  ));
});

jest.mock('../patient-search-bar/patient-search-bar.component', () => {
  return jest.fn(({ initialSearchTerm }) => (
    <div data-testid="mock-patient-search-bar">
      <span data-testid="workspace-query">{initialSearchTerm}</span>
    </div>
  ));
});

jest.mock('../patient-search-page/advanced-patient-search.component', () => {
  return jest.fn(({ patientClickSideEffect }) => (
    <div data-testid="mock-advanced-patient-search">
      <button
        onClick={() => patientClickSideEffect?.('patient-123', { id: 'patient-123' } as any)}
        data-testid="workspace-side-effect-btn">
        Trigger Side Effect
      </button>
    </div>
  ));
});

jest.mock('@openmrs/esm-framework', () => {
  return {
    useConfig: () => ({ search: { disableTabletSearchOnKeyUp: false } }),
    useDebounce: (value: any) => value,
  };
});

describe('PatientSearchOverlay', () => {
  const mockOnClose = jest.fn();
  const mockPatientClickSideEffect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<PatientSearchOverlay onClose={mockOnClose} />);

    expect(screen.getByTestId('mock-overlay')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Search results' })).toBeInTheDocument();

    expect(screen.getByTestId('mock-patient-search-bar')).toBeInTheDocument();
    expect(screen.getByTestId('workspace-query')).toHaveTextContent(''); // default empty string
  });

  it('renders with custom header and query', () => {
    render(<PatientSearchOverlay onClose={mockOnClose} query="John Doe" header="Custom Header" />);

    expect(screen.getByRole('heading', { name: 'Custom Header' })).toBeInTheDocument();
    expect(screen.getByTestId('workspace-query')).toHaveTextContent('John Doe');
  });

  it('calls onClose when overlay close button is clicked', async () => {
    const user = userEvent.setup();
    render(<PatientSearchOverlay onClose={mockOnClose} />);

    const closeBtn = screen.getByTestId('close-overlay-btn');
    await user.click(closeBtn);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('passes patientClickSideEffect to AdvancedPatientSearchComponent', async () => {
    const user = userEvent.setup();
    // need query to render the advanced component
    render(
      <PatientSearchOverlay onClose={mockOnClose} query="John" patientClickSideEffect={mockPatientClickSideEffect} />,
    );

    const sideEffectBtn = screen.getByTestId('workspace-side-effect-btn');
    await user.click(sideEffectBtn);

    expect(mockPatientClickSideEffect).toHaveBeenCalledWith(
      'patient-123',
      expect.objectContaining({ id: 'patient-123' }),
    );
  });
});
