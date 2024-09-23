import React from 'react';
import WardMetrics from './ward-metrics.component';
import { renderWithSwr } from '../../../../tools/test-utils';
import { useBeds } from '../hooks/useBeds';
import { mockWardBeds } from '../../../../__mocks__/wardBeds.mock';
import {
  createAndGetWardPatientGrouping,
  getInpatientAdmissionsUuidMap,
  getWardMetrics,
} from '../ward-view/ward-view.resource';
import { useAdmissionLocation } from '../hooks/useAdmissionLocation';
import { mockAdmissionLocation, mockInpatientAdmissions, mockInpatientRequest } from '__mocks__';
import { useInpatientAdmission } from '../hooks/useInpatientAdmission';
import useWardLocation from '../hooks/useWardLocation';
import { screen } from '@testing-library/react';
import { useAppContext } from '@openmrs/esm-framework';

const wardMetrics = [
  { name: 'patients', key: 'patients', defaultTranslation: 'Patients' },
  { name: 'freeBeds', key: 'freeBeds', defaultTranslation: 'Free beds' },
  { name: 'capacity', key: 'capacity', defaultTranslation: 'Capacity' },
];

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn().mockReturnValue({}),
}));

jest.mock('../hooks/useWardLocation', () =>
  jest.fn().mockReturnValue({
    location: { uuid: 'abcd', display: 'mock location' },
    isLoadingLocation: false,
    errorFetchingLocation: null,
    invalidLocation: false,
  }),
);

const mockUseWardLocation = jest.mocked(useWardLocation);

jest.mock('../hooks/useBeds', () => ({
  useBeds: jest.fn(),
}));

jest.mock('../hooks/useAdmissionLocation', () => ({
  useAdmissionLocation: jest.fn(),
}));
jest.mock('../hooks/useInpatientAdmission', () => ({
  useInpatientAdmission: jest.fn(),
}));

jest.mock('../hooks/useInpatientRequest', () => ({
  useInpatientRequest: jest.fn(),
}));

jest.mocked(useBeds).mockReturnValue({
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  beds: mockWardBeds,
});

const mockAdmissionLocationResponse = jest.mocked(useAdmissionLocation).mockReturnValue({
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  admissionLocation: mockAdmissionLocation,
});
const mockInpatientAdmissionResponse = jest.mocked(useInpatientAdmission).mockReturnValue({
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  inpatientAdmissions: mockInpatientAdmissions,
});

const inpatientAdmissionsUuidMap = getInpatientAdmissionsUuidMap(mockInpatientAdmissions);
const mockWardPatientGroupDetails = {
  admissionLocationResponse: mockAdmissionLocationResponse(),
  inpatientAdmissionResponse: mockInpatientAdmissionResponse(),
  ...createAndGetWardPatientGrouping(mockInpatientAdmissions, mockAdmissionLocation, mockInpatientRequest),
};
jest.mocked(useAppContext).mockReturnValue(mockWardPatientGroupDetails);
describe('Ward Metrics', () => {
  it('Should display metrics of in the ward ', () => {
    mockUseWardLocation.mockReturnValueOnce({
      location: null,
      isLoadingLocation: false,
      errorFetchingLocation: null,
      invalidLocation: true,
    });
    const bedMetrics = getWardMetrics(mockWardBeds, mockWardPatientGroupDetails);
    renderWithSwr(<WardMetrics />);
    for (let [key, value] of Object.entries(bedMetrics)) {
      const fieldName = wardMetrics.find((metric) => metric.name == key)?.defaultTranslation;
      expect(screen.getByText(fieldName)).toBeInTheDocument();
    }
  });
});
