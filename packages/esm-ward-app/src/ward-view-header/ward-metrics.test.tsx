import React from 'react';
import WardMetrics from './ward-metrics.component';
import { renderWithSwr } from '../../../../tools/test-utils';
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
import { type WardViewContext } from '../types';
import { mockWardViewContext } from '../../mock';

const wardMetrics = [
  { name: 'patients', key: 'patients', defaultTranslation: 'Patients' },
  { name: 'freeBeds', key: 'freeBeds', defaultTranslation: 'Free beds' },
  { name: 'capacity', key: 'capacity', defaultTranslation: 'Capacity' },
];

jest.mocked(useAppContext<WardViewContext>).mockReturnValue(mockWardViewContext);

describe('Ward Metrics', () => {
  it('Should display metrics of in the ward ', () => {
    const mockWardPatientGroupDetails = mockWardViewContext.wardPatientGroupDetails;
    const { bedLayouts } = mockWardPatientGroupDetails;
    const bedMetrics = getWardMetrics(bedLayouts, mockWardPatientGroupDetails);
    renderWithSwr(<WardMetrics />);
    for (let [key, value] of Object.entries(bedMetrics)) {
      const fieldName = wardMetrics.find((metric) => metric.name == key)?.defaultTranslation;
      expect(screen.getByText(fieldName!)).toBeInTheDocument();
    }
  });
});
