import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  type FetchResponse,
  getDefaultsFromConfigSchema,
  openmrsFetch,
  useConfig,
  useLocations,
  useSession,
} from '@openmrs/esm-framework';
import { mockMetrics, mockServiceTypes, mockLocations, mockSession } from '__mocks__';
import { type ConfigObject, configSchema } from '../config-schema';
import ClinicMetrics from './clinic-metrics.component';

const mockOpenmrsFetch = jest.mocked(openmrsFetch);
const mockUseConfig = jest.mocked(useConfig<ConfigObject>);
const mockUseLocations = jest.mocked(useLocations);
const mockUseSession = jest.mocked(useSession);

jest.mock('./queue-metrics.resource', () => ({
  ...jest.requireActual('./queue-metrics.resource'),
  useServiceMetricsCount: jest.fn().mockReturnValue(5),
}));

jest.mock('../hooks/useQueues', () => {
  return {
    useQueues: jest.fn().mockReturnValue({ queues: mockServiceTypes.data }),
  };
});

jest.mock('./clinic-metrics.resource', () => ({
  ...jest.requireActual('./clinic-metrics.resource'),
  useActiveVisits: jest.fn().mockReturnValue({
    activeVisitsCount: mockMetrics.activeVisitsCount,
  }),
  useAverageWaitTime: jest.fn().mockReturnValue({ waitTime: mockMetrics.waitTime }),
}));

jest.mock('../helpers/helpers', () => ({
  ...jest.requireActual('../helpers/helpers'),
  useSelectedServiceName: jest.fn().mockReturnValue('All'),
}));

describe('Clinic metrics', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
    });
    mockUseLocations.mockReturnValue(mockLocations.data.results);
    mockUseSession.mockReturnValue(mockSession.data);
  });

  it('renders a dashboard outlining metrics from the outpatient clinic', async () => {
    mockUseConfig.mockReturnValue({
      ...getDefaultsFromConfigSchema(configSchema),
      visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
    });

    mockOpenmrsFetch.mockResolvedValue({ data: mockMetrics } as unknown as FetchResponse);

    render(<ClinicMetrics />);

    await screen.findByText(/Checked in patients/i);
    expect(screen.getByText(/100/i)).toBeInTheDocument();
    expect(screen.getAllByText(/patient list/i));
    expect(screen.getByText(/Average wait time today/i)).toBeInTheDocument();
    expect(screen.getByText(/minutes/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /queue screen/i })).toBeInTheDocument();
    expect(screen.getByText(/69/i)).toBeInTheDocument();
  });
});
