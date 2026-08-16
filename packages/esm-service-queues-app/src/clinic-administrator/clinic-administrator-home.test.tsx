import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDefaultsFromConfigSchema, useConfig } from '@openmrs/esm-framework';
import { configSchema, type ConfigObject } from '../config-schema';
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
import { useClinicQueueMetrics } from '../hooks/useClinicQueueMetrics';
import { updateSelectedQueueLocationUuid } from '../store/store';
import { type Queue } from '../types';
import ClinicAdministratorHome from './clinic-administrator-home.component';

vi.mock('../hooks/useClinicQueueMetrics');
vi.mock('../create-queue-entry/hooks/useQueueLocations');
vi.mock('../store/store', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  updateSelectedQueueLocationUuid: vi.fn(),
  updateSelectedQueueLocationName: vi.fn(),
  useServiceQueuesStore: vi.fn(() => ({ selectedQueueLocationUuid: null, selectedQueueLocationName: null })),
}));

const mockUseClinicQueueMetrics = vi.mocked(useClinicQueueMetrics);
const mockUseQueueLocations = vi.mocked(useQueueLocations);

function queue(uuid: string, display: string, location: string, service: string): Queue {
  return { uuid, display, name: display, location: { display: location }, service: { display: service } } as Queue;
}

function rollup(queue: Queue, waiting: number, attending: number, longestWaitMinutes: number | null, patient = '') {
  return {
    queue,
    waiting,
    attending,
    totalWaitMinutes: 0,
    averageWaitMinutes: longestWaitMinutes,
    longestWait:
      longestWaitMinutes === null ? null : { minutes: longestWaitMinutes, startedAt: new Date(), patientName: patient },
  };
}

const rollups = [
  rollup(queue('q1', 'Triage', 'Outpatient clinic', 'Triage'), 12, 3, 38, 'Esther Nabwire'),
  rollup(queue('q2', 'Clinician review', 'Outpatient clinic', 'Clinical consultation'), 8, 2, 108, 'Achieng Otieno'),
  rollup(queue('q3', 'Antenatal', 'MCH clinic', 'Antenatal care'), 0, 0, null),
];

function givenMetrics(overrides: Partial<ReturnType<typeof useClinicQueueMetrics>> = {}) {
  mockUseClinicQueueMetrics.mockReturnValue({
    rollups,
    totals: {
      waiting: 20,
      attending: 5,
      totalWaitMinutes: 520,
      averageWaitMinutes: 26,
      longestWait: { minutes: 108, startedAt: new Date(), patientName: 'Achieng Otieno' },
    },
    isLoading: false,
    error: undefined,
    ...overrides,
  } as ReturnType<typeof useClinicQueueMetrics>);
}

describe('ClinicAdministratorHome', () => {
  beforeEach(() => {
    vi.mocked(useConfig<ConfigObject>).mockReturnValue(getDefaultsFromConfigSchema<ConfigObject>(configSchema));
    mockUseQueueLocations.mockReturnValue({
      queueLocations: [
        { id: 'loc-1', name: 'Outpatient clinic' },
        { id: 'loc-2', name: 'MCH clinic' },
      ],
      isLoading: false,
      error: undefined,
    } as ReturnType<typeof useQueueLocations>);
    givenMetrics();
  });

  it('renders a row per queue, the clinic totals, and a link into each queue', () => {
    render(<ClinicAdministratorHome />);

    const review = screen.getByRole('row', { name: /clinician review/i });
    expect(within(review).getByText('8')).toBeInTheDocument();
    expect(within(review).getByText('Achieng Otieno')).toBeInTheDocument();
    expect(within(review).getByRole('link', { name: /view/i })).toHaveAttribute(
      'href',
      expect.stringContaining('queue-table-by-status/q2'),
    );

    const metrics = screen.getByTestId('clinic-administrator-metrics');
    expect(within(metrics).getByText('20')).toBeInTheDocument();
    expect(within(metrics).getByText('26')).toBeInTheDocument();
  });

  it('puts the queue with the longest wait first, so the worst one needs no sorting', () => {
    render(<ClinicAdministratorHome />);

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows[0]).toHaveTextContent('Clinician review');
    expect(rows[rows.length - 1]).toHaveTextContent('Antenatal');
  });

  it('narrows to a single location when one is chosen', async () => {
    const user = userEvent.setup();
    render(<ClinicAdministratorHome />);

    await user.click(screen.getByRole('combobox', { name: /select a queue location/i }));
    // Scoped to the dropdown: "MCH clinic" is also a location cell in the table.
    await user.click(within(screen.getByRole('listbox')).getByText('MCH clinic'));

    expect(updateSelectedQueueLocationUuid).toHaveBeenCalledWith('loc-2');
  });

  it('renders an empty state when the clinic has no queues', () => {
    givenMetrics({ rollups: [] });
    render(<ClinicAdministratorHome />);

    expect(screen.getByText(/no queues to display/i)).toBeInTheDocument();
  });

  it('renders an error state when the roll-up fails', () => {
    givenMetrics({ error: new Error('boom') });
    render(<ClinicAdministratorHome />);

    expect(screen.getByText(/error state/i)).toBeInTheDocument();
  });
});
