import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { openmrsFetch, useConfig } from '@openmrs/esm-framework';

import ClinicMetrics from './clinic-metrics.component';
import { mockMetrics, mockServices } from '../../__mocks__/metrics.mock';
import { waitForLoadingToFinish } from '../../../../tools/test-helpers';

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;
const mockedUseConfig = useConfig as jest.Mock;

jest.mock('./queue-metrics.resource.ts', () => {
  const originalModule = jest.requireActual('./queue-metrics.resource.ts');

  return {
    ...originalModule,
    useServices: jest.fn().mockImplementation(() => ({
      services: mockServices,
    })),
  };
});

describe('Clinic metrics', () => {
  it('renders a dashboard outlining metrics from the outpatient clinic', async () => {
    const user = userEvent.setup();

    mockedUseConfig.mockReturnValue({
      concepts: {
        serviceConceptSetUuid: '330c0ec6-0ac7-4b86-9c70-29d76f0ae20a',
      },
    });
    mockedOpenmrsFetch.mockReturnValueOnce({ data: mockMetrics });

    renderMetrics();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Scheduled appts. today/i)).toBeInTheDocument();
    expect(screen.getByText(/100/i)).toBeInTheDocument();
    expect(screen.getByText(/Average wait time today/i)).toBeInTheDocument();
    expect(screen.getByText(/minutes/i)).toBeInTheDocument();
    expect(screen.getByText(/28/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /see more metrics/i })).toBeInTheDocument();
    expect(screen.getAllByText(/patient list/i));

    // Select a different service to show metrics for
    const serviceDropdown = screen.getByRole('button', { name: /triage open menu/i });

    await user.click(serviceDropdown);
    await user.click(screen.getByRole('option', { name: /clinical consultation/i }));

    expect(screen.getByRole('button', { name: /clinical consultation/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /triage/i })).not.toBeInTheDocument();
  });
});

function renderMetrics() {
  render(<ClinicMetrics />);
}
