import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { ConfigObject, openmrsFetch, useConfig } from '@openmrs/esm-framework';

import ClinicMetrics from './clinic-metrics.component';
import { mockMetrics, mockServiceTypes } from '../../../../__mocks__/metrics.mock';
import { waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { mockLocations } from '../../../../__mocks__/locations.mock';
import { mockSession } from '../../../../__mocks__/session.mock';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;
const mockedUseConfig = useConfig as jest.Mock;

jest.mock('./queue-metrics.resource.ts', () => {
  const originalModule = jest.requireActual('./queue-metrics.resource.ts');

  return {
    ...originalModule,
    useServices: jest.fn().mockImplementation(() => ({ allServices: mockServiceTypes.data })),
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

describe('Clinic metrics', () => {
  beforeEach(() =>
    mockedUseConfig.mockReturnValue({
      concepts: {
        visitQueueNumberAttributeUuid: 'c61ce16f-272a-41e7-9924-4c555d0932c5',
      },
    } as ConfigObject),
  );
  it('renders a dashboard outlining metrics from the outpatient clinic', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({ data: mockMetrics });

    renderMetrics();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Scheduled appts. today/i)).toBeInTheDocument();
    expect(screen.getByText(/Average wait time today/i)).toBeInTheDocument();
    expect(screen.getByText(/minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/--/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /see more metrics/i })).toBeInTheDocument();
    expect(screen.getAllByText(/patient list/i));

    // Select a different service to show metrics for
    expect(screen.getByRole('button', { name: /open menu/i }));
  });
});

function renderMetrics() {
  render(<ClinicMetrics />);
}
