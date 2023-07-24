import React from 'react';
import { render, screen } from '@testing-library/react';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import ClinicMetrics from './clinic-metrics.component';
import { mockMetrics, mockServiceTypes } from '../../../../__mocks__/metrics.mock';
import { mockLocations } from '../../../../__mocks__/locations.mock';
import { mockSession } from '../../../../__mocks__/session.mock';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;
const mockedUseConfig = useConfig as jest.Mock;

jest.mock('./queue-metrics.resource.ts', () => {
  const originalModule = jest.requireActual('./queue-metrics.resource.ts');

  return {
    ...originalModule,
    useServices: jest.fn().mockImplementation(() => ({ allServices: mockServiceTypes.data })),
    useServiceMetricsCount: jest.fn().mockReturnValue(5),
  };
});

jest.mock('./clinic-metrics.resource.tsx', () => {
  const originalModule = jest.requireActual('./clinic-metrics.resource.tsx');

  return {
    ...originalModule,
    useAverageWaitTime: jest.fn().mockImplementation(() => ({ waitTime: mockMetrics.waitTime })),
    useActiveVisits: jest.fn().mockImplementation(() => ({ activeVisitsCount: mockMetrics.activeVisitsCount })),
  };
});

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    useLocations: jest.fn().mockImplementation(() => mockLocations.data),
    useSession: jest.fn().mockImplementation(() => mockSession.data),
  };
});

jest.mock('../helpers/helpers.tsx', () => {
  const originalModule = jest.requireActual('../helpers/helpers.tsx');

  return {
    ...originalModule,
    useSelectedServiceName: jest.fn().mockReturnValue('All'),
  };
});

jest.mock('../active-visits/active-visits-table.resource.ts', () => {
  const originalModule = jest.requireActual('../active-visits/active-visits-table.resource.ts');

  return {
    ...originalModule,
    useVisitQueueEntries: jest.fn().mockReturnValue(5),
  };
});

describe('Clinic metrics', () => {
  it('renders a dashboard outlining metrics from the outpatient clinic', async () => {
    mockedUseConfig.mockReturnValue({
      concepts: {
        visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
      },
    });

    mockedOpenmrsFetch.mockReturnValue({ data: mockMetrics });

    renderClinicMetrics();

    await screen.findByText(/Checked in patients/i);
    expect(screen.getByText(/100/i)).toBeInTheDocument();
    expect(screen.getAllByText(/patient list/i));
    expect(screen.getByText(/Average wait time today/i)).toBeInTheDocument();
    expect(screen.getByText(/minutes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Queue screen/i })).toBeInTheDocument();
    expect(screen.getByText(/69/i)).toBeInTheDocument();

    // Select a different service to show metrics for
    expect(screen.getByRole('button', { name: /open menu/i }));
  });
});

function renderClinicMetrics() {
  render(<ClinicMetrics />);
}
