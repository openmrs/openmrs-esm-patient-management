import React from 'react';
import { screen } from '@testing-library/react';
import {
  type Person,
  type ConfigSchema,
  getDefaultsFromConfigSchema,
  useConfig,
  useFeatureFlag,
} from '@openmrs/esm-framework';
import { useParams } from 'react-router-dom';
import { mockAdmissionLocation, mockInpatientVisits } from '__mocks__';
import { renderWithSwr } from 'tools';
import { configSchema } from '../config-schema';
import { useAdmissionLocation } from '../hooks/useAdmissionLocation';
import { mockPatientAlice } from '__mocks__';
import { useAdmittedPatients } from '../hooks/useAdmittedPatients';
import useWardLocation from '../hooks/useWardLocation';
import WardView from './ward-view.component';

jest.replaceProperty(mockPatientAlice.person as Person, 'preferredName', {
  uuid: '',
  givenName: 'Alice',
  familyName: 'Johnson',
});

jest.mocked(useConfig).mockReturnValue({
  ...getDefaultsFromConfigSchema<ConfigSchema>(configSchema),
});

const mockedUseFeatureFlag = useFeatureFlag as jest.Mock;

jest.mock('../hooks/useWardLocation', () =>
  jest.fn().mockReturnValue({
    location: { uuid: 'abcd', display: 'mock location' },
    isLoadingLocation: false,
    errorFetchingLocation: null,
    invalidLocation: false,
  }),
);

const mockedUseWardLocation = useWardLocation as jest.Mock;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({}),
}));
const mockedUseParams = useParams as jest.Mock;

jest.mock('../hooks/useAdmissionLocation', () => ({
  useAdmissionLocation: jest.fn(),
}));
jest.mock('../hooks/useAdmittedPatients', () => ({
  useAdmittedPatients: jest.fn(),
}));

jest.mocked(useAdmissionLocation).mockReturnValue({
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  admissionLocation: mockAdmissionLocation,
});
jest.mocked(useAdmittedPatients).mockReturnValue({
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  admittedPatients: mockInpatientVisits,
});

describe('WardView:', () => {
  it('renders the session location when no location provided in URL', () => {
    renderWithSwr(<WardView />);
    const header = screen.getByRole('heading', { name: 'mock location' });
    expect(header).toBeInTheDocument();
  });

  it('renders the location provided in URL', () => {
    mockedUseParams.mockReturnValueOnce({ locationUuid: 'abcd' });
    renderWithSwr(<WardView />);
    const header = screen.getByRole('heading', { name: 'mock location' });
    expect(header).toBeInTheDocument();
  });

  it('renders the correct number of occupied and empty beds', async () => {
    renderWithSwr(<WardView />);
    const emptyBedCards = await screen.findAllByText(/empty bed/i);
    expect(emptyBedCards).toHaveLength(3);
  });

  it('renders admitted patient without bed', async () => {
    renderWithSwr(<WardView />);
    const admittedPatientWithoutBed = screen.queryByText('Nicks, Stevie');
    expect(admittedPatientWithoutBed).toBeInTheDocument();
  });

  it('renders all admitted patients even if bed management module not installed', async () => {
    mockedUseFeatureFlag.mockReturnValueOnce(false);
    renderWithSwr(<WardView />);
    const admittedPatientWithoutBed = screen.queryByText('Nicks, Stevie');
    expect(admittedPatientWithoutBed).toBeInTheDocument();
  });

  it('renders notification for invalid location uuid', () => {
    mockedUseWardLocation.mockReturnValueOnce({
      location: null,
      isLoadingLocation: false,
      errorFetchingLocation: null,
      invalidLocation: true,
    });

    renderWithSwr(<WardView />);
    const notification = screen.getByRole('status');
    expect(notification).toBeInTheDocument();
    const invalidText = screen.queryByText('Invalid location specified');
    expect(invalidText).toBeInTheDocument();
  });

  it('screen should render warning if backend module installed and no beds configured', () => {
    // override the default response so that no beds are returned
    jest.mocked(useAdmissionLocation).mockReturnValue({
      error: undefined,
      mutate: jest.fn(),
      isValidating: false,
      isLoading: false,
      admissionLocation: { ...mockAdmissionLocation, bedLayouts: [] },
    });
    mockedUseFeatureFlag.mockReturnValueOnce(true);

    renderWithSwr(<WardView />);
    const noBedsConfiguredForThisLocation = screen.queryByText('No beds configured for this location');
    expect(noBedsConfiguredForThisLocation).toBeInTheDocument();
  });

  it('screen not should render warning if backend module installed and no beds configured', () => {
    // override the default response so that no beds are returned
    jest.mocked(useAdmissionLocation).mockReturnValue({
      error: undefined,
      mutate: jest.fn(),
      isValidating: false,
      isLoading: false,
      admissionLocation: { ...mockAdmissionLocation, bedLayouts: [] },
    });
    mockedUseFeatureFlag.mockReturnValueOnce(false);

    renderWithSwr(<WardView />);
    const noBedsConfiguredForThisLocation = screen.queryByText('No beds configured for this location');
    expect(noBedsConfiguredForThisLocation).not.toBeInTheDocument();
  });
});
