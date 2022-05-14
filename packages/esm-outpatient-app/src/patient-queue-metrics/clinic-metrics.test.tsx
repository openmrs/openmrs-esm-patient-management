import React from 'react';
import { render, screen } from '@testing-library/react';
import ClinicMetrics from './clinic-metrics.component';
import { openmrsFetch } from '@openmrs/esm-framework';
import { waitForLoadingToFinish } from '../../../../tools/test-helpers';
import { mockMetrics } from '../../__mocks__/metrics.mock';

const mockOpenmrsFetch = openmrsFetch as jest.Mock;

describe('Metrics ', () => {
  it('should render clinic metrics correctly', async () => {
    mockOpenmrsFetch.mockReturnValueOnce({ data: mockMetrics });
    renderMetrics();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Scheduled appts. today/i)).toBeInTheDocument();
    expect(screen.getByText(/Waiting for:/i)).toBeInTheDocument();
    expect(screen.getByText(/Average wait time today/i)).toBeInTheDocument();
    expect(screen.getByText(/100/i)).toBeInTheDocument();
    expect(screen.getByText(/8/i)).toBeInTheDocument();
    expect(screen.getByText(/28/i)).toBeInTheDocument();
  });
});

function renderMetrics() {
  render(<ClinicMetrics />);
}
