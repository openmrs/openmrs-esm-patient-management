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
import { mockWardPatientGroupDetails } from '../../mock';

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

jest.mock('../hooks/useBeds', () => ({
  useBeds: jest.fn(),
}));

jest.mocked(useBeds).mockReturnValue({
  error: undefined,
  mutate: jest.fn(),
  isValidating: false,
  isLoading: false,
  beds: mockWardBeds,
  totalCount: mockWardBeds.length,
  hasMore: false,
  loadMore: jest.fn(),
});

jest.mocked(useAppContext).mockReturnValue(mockWardPatientGroupDetails());
describe('Ward Metrics', () => {
  it('Should display metrics of in the ward ', () => {
    const bedMetrics = getWardMetrics(mockWardBeds, mockWardPatientGroupDetails());
    renderWithSwr(<WardMetrics />);
    for (let [key, value] of Object.entries(bedMetrics)) {
      const fieldName = wardMetrics.find((metric) => metric.name == key)?.defaultTranslation;
      expect(screen.getByText(fieldName!)).toBeInTheDocument();
    }
  });
});
