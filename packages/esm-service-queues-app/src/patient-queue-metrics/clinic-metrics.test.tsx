import React from 'react';
import { render, screen } from '@testing-library/react';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';
import { mockMetrics, mockServiceTypes, mockLocations, mockSession } from '__mocks__';
import ClinicMetrics from './clinic-metrics.component';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;
const mockedUseConfig = useConfig as jest.Mock;

jest.mock('./queue-metrics.resource', () => {
  const originalModule = jest.requireActual('./queue-metrics.resource');

  return {
    ...originalModule,
    useServiceMetricsCount: jest.fn().mockReturnValue(5),
  };
});

jest.mock('../helpers/useQueues', () => {
  return {
    useQueues: jest.fn().mockReturnValue({ queues: mockServiceTypes.data }),
  };
});

jest.mock('./clinic-metrics.resource', () => {
  const originalModule = jest.requireActual('./clinic-metrics.resource');

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

jest.mock('../helpers/helpers', () => {
  const originalModule = jest.requireActual('../helpers/helpers');

  return {
    ...originalModule,
    useSelectedServiceName: jest.fn().mockReturnValue('All'),
  };
});

describe('Clinic metrics', () => {
  it('renders a dashboard outlining metrics from the outpatient clinic', async () => {
    mockedUseConfig.mockReturnValue({
      visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
    });

    mockedOpenmrsFetch.mockReturnValue({ data: mockMetrics });

    renderClinicMetrics();

    await screen.findByText(/Checked in patients/i);
    expect(screen.getByText(/100/i)).toBeInTheDocument();
    expect(screen.getAllByText(/patient list/i));
    expect(screen.getByText(/Average wait time today/i)).toBeInTheDocument();
    expect(screen.getByText(/minutes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /queue screen/i })).toBeInTheDocument();
    expect(screen.getByText(/69/i)).toBeInTheDocument();
  });
});

function renderClinicMetrics() {
  render(<ClinicMetrics />);
}
