import React from 'react';
import { screen, render } from '@testing-library/react';
import PatientSearchLaunch from './patient-search-launch.component';
import { navigate, useConfig } from '@openmrs/esm-framework';
import userEvent from '@testing-library/user-event';
import { usePatients } from '../hooks/usePatients';
import { mockPatients } from '../../../../__mocks/patient.mock';

const mockUsePatients = usePatients as jest.Mock;
const mockNavigate = navigate as jest.Mock;
const mockUseConfig = useConfig as jest.Mock;

jest.mock('lodash/isEmpty', () => jest.fn((arr) => arr.length === 0));

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');
  return {
    ...originalModule,
    useOnClickOutside: jest.fn(),
    usePagination: jest.fn(() => ({ totalPages: 6, results: mockPatients.slice(0, 5), goTo: jest.fn() })),
    navigate: jest.fn(),
    useConfig: jest.fn(),
  };
});

jest.mock('../hooks/usePatients', () => {
  return {
    usePatients: jest.fn(),
  };
});

describe('PatientSearchLaunch', () => {
  test('should render patient-search launch correctly and perform a search', () => {
    mockUseConfig.mockReturnValue({
      search: { patientResultUrl: '${openmrsSpaBase}/patient/${patientUuid}/chart' },
    });
    mockUsePatients.mockReturnValue({ patients: mockPatients, isLoading: false, error: null });
    renderPatientSearchLaunch();

    const launchPatientSearchButton = screen.getByRole('button', { name: /Search Patient/i });
    expect(launchPatientSearchButton).toBeInTheDocument();

    userEvent.click(launchPatientSearchButton);

    const searchTermInput = screen.getByPlaceholderText(/Search for a patient by name or identifier number/);
    expect(searchTermInput).toBeInTheDocument();

    userEvent.type(searchTermInput, 'Test 2.13');

    const triggerSearchButton = screen.getByRole('button', { name: /^Search$/i });
    expect(triggerSearchButton).toBeInTheDocument();

    userEvent.click(triggerSearchButton);

    expect(mockUsePatients).toHaveBeenCalledWith('Test 2.13');

    expect(screen.getAllByRole('button', { name: /Start visit/ }).length).toEqual(4);
    expect(screen.getAllByRole('button', { name: /Action/ }).length).toEqual(5);

    const firstPatient = screen.getByText(/^Test 2.13.2 Test$/i);
    expect(firstPatient).toBeInTheDocument();

    userEvent.click(firstPatient);
    expect(mockNavigate).toHaveBeenCalledWith({
      to: '${openmrsSpaBase}/patient/ae6c955b-f3b6-47e6-b036-59f2055c2002/chart',
    });
  });
});

const renderPatientSearchLaunch = () => render(<PatientSearchLaunch />);
