import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useConfig, navigate, interpolateString } from '@openmrs/esm-framework';
import { useInfinitePatientSearch } from './patient-search.resource';
import useArrowNavigation from './hooks/useArrowNavigation';
import CompactPatientSearchComponent from './compact-patient-search.extension';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string, fallback: string) => fallback }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  useConfig: jest.fn(),
  navigate: jest.fn(),
  interpolateString: jest.fn((str, params) => `${str}?uuid=${params.patientUuid}`),
}));

jest.mock('./patient-search.resource', () => ({
  useInfinitePatientSearch: jest.fn(),
}));

jest.mock('./hooks/useArrowNavigation', () => jest.fn());

jest.mock('./compact-patient-search/patient-search.component', () => {
  return jest.fn(({ query, patientClickSideEffect, nonNavigationSelectPatientAction }) => (
    <div data-testid="mock-patient-search">
      <button onClick={() => nonNavigationSelectPatientAction?.('patient-123')} data-testid="select-action-btn">
        Select Action
      </button>
      <button onClick={patientClickSideEffect} data-testid="click-side-effect-btn">
        Clear
      </button>
    </div>
  ));
});

const mockUseConfig = jest.mocked(useConfig);
const mockNavigate = jest.mocked(navigate);
const mockUseInfinitePatientSearch = jest.mocked(useInfinitePatientSearch);
const mockUseArrowNavigation = jest.mocked(useArrowNavigation);

describe('CompactPatientSearchComponent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseConfig.mockReturnValue({ includeDead: false, search: { patientChartUrl: '/patient/chart' } } as any);
    mockUseInfinitePatientSearch.mockReturnValue({ data: [] } as any);
    mockUseArrowNavigation.mockReturnValue(-1);
  });

  it('renders correctly with empty initial search term', () => {
    render(<CompactPatientSearchComponent initialSearchTerm="" />);
    expect(screen.getByPlaceholderText('Search for a patient by name or identifier number')).toBeInTheDocument();
    expect(screen.queryByTestId('mock-patient-search')).not.toBeInTheDocument();
  });

  it('renders mock patient search when search term is entered', async () => {
    const user = userEvent.setup();
    render(<CompactPatientSearchComponent initialSearchTerm="" />);

    const input = screen.getByPlaceholderText('Search for a patient by name or identifier number');
    await user.type(input, 'John');

    expect(screen.getByTestId('mock-patient-search')).toBeInTheDocument();
    expect(mockUseInfinitePatientSearch).toHaveBeenCalledWith('John', false, true);
  });

  it('calls handleClear when patientClickSideEffect is triggered', async () => {
    const user = userEvent.setup();
    render(<CompactPatientSearchComponent initialSearchTerm="John" />);

    expect(screen.getByDisplayValue('John')).toBeInTheDocument();

    const clearBtn = screen.getByTestId('click-side-effect-btn');
    await user.click(clearBtn);

    expect(screen.queryByDisplayValue('John')).not.toBeInTheDocument();
    expect(screen.queryByTestId('mock-patient-search')).not.toBeInTheDocument();
  });

  it('calls selectPatientAction when provided and patient is selected', async () => {
    const selectPatientAction = jest.fn();
    const user = userEvent.setup();
    render(<CompactPatientSearchComponent initialSearchTerm="John" selectPatientAction={selectPatientAction} />);

    const selectBtn = screen.getByTestId('select-action-btn');
    await user.click(selectBtn);

    expect(selectPatientAction).toHaveBeenCalledWith('patient-123');
  });

  it('handles clear button click', async () => {
    const user = userEvent.setup();
    render(<CompactPatientSearchComponent initialSearchTerm="John" />);

    const clearBtn = screen.getByTestId('click-side-effect-btn');
    await user.click(clearBtn);

    expect(screen.queryByDisplayValue('John')).not.toBeInTheDocument();
  });
});
