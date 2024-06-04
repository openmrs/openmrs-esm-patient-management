import  { type Person, getDefaultsFromConfigSchema, useConfig, useSession } from '@openmrs/esm-framework';
import { screen } from '@testing-library/react';
import React from 'react';
import { useParams } from 'react-router-dom';
import { mockLocations } from '../../../../__mocks__/locations.mock';
import { mockAdmissionLocation } from '../../../../__mocks__/wards.mock';
import { renderWithSwr } from '../../../../tools/test-utils';
import { configSchema } from '../config-schema';
import { useAdmissionLocation } from '../hooks/useAdmissionLocation';
import WardView from './ward-view.component';
import { mockPatientAlice } from '../../../../__mocks__/patient.mock';

jest.replaceProperty(mockPatientAlice.person as Person, 'preferredName', {
  uuid: '',
  givenName: 'Alice',
  familyName: 'Johnson',
});

jest.mocked(useConfig).mockReturnValue({
  ...getDefaultsFromConfigSchema(configSchema),
});

const mockedSessionLocation = { uuid: 'abcd', display: 'mock location', links: [] };
jest.mocked(useSession).mockReturnValue({
  sessionLocation: mockedSessionLocation,
  authenticated: true,
  sessionId: 'sessionId',
});

jest.mock('@openmrs/esm-framework', () => {
  return {
    ...jest.requireActual('@openmrs/esm-framework'),
    useLocations: jest.fn().mockImplementation(() => mockLocations.data.results),
  };
});

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({}),
}));
const mockedUseParams = useParams as jest.Mock;

jest.mock('../hooks/useAdmissionLocation', () => ({
  useAdmissionLocation: jest.fn(),
}));
jest.mocked(useAdmissionLocation).mockReturnValue({
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  admissionLocation: mockAdmissionLocation,
});

describe('WardView:', () => {
  it('renders the session location when no location provided in URL', () => {
    renderWithSwr(<WardView />);
    const header = screen.getByRole('heading', { name: mockedSessionLocation.display });
    expect(header).toBeInTheDocument();
  });

  it('renders the location provided in URL', () => {
    const locationToUse = mockLocations.data.results[0];
    mockedUseParams.mockReturnValueOnce({ locationUuid: locationToUse.uuid });
    renderWithSwr(<WardView />);
    const header = screen.getByRole('heading', { name: locationToUse.display });
    expect(header).toBeInTheDocument();
  });

  it('renders the correct number of occupied and empty beds', async () => {
    renderWithSwr(<WardView />);
    const emptyBedCards = await screen.findAllByText(/empty bed/i);
    expect(emptyBedCards).toHaveLength(3);
  });

  it('renders notification for invalid location uuid', () => {
    mockedUseParams.mockReturnValueOnce({ locationUuid: 'invalid-uuid' });
    renderWithSwr(<WardView />);
    const notification = screen.getByRole('status');
    expect(notification).toBeInTheDocument();
    const invalidText = screen.getByText('Unknown location uuid: invalid-uuid');
    expect(invalidText).toBeInTheDocument();
  });
});
