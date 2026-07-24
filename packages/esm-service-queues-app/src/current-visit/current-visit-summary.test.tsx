import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { mockPastVisit } from '__mocks__';
import { serviceQueuesPatientVitalsWorkspace } from '../constants';
import { useVisit } from './current-visit.resource';
import CurrentVisit from './current-visit-summary.component';

const useVisitMock = vi.mocked(useVisit);

const { launchWorkspace2Mock, capturedSlotStates } = vi.hoisted(() => ({
  launchWorkspace2Mock: vi.fn(),
  capturedSlotStates: {} as Record<string, any>,
}));

vi.mock('@openmrs/esm-framework', async (importOriginal) => ({
  ...((await importOriginal()) as object),
  usePatient: () => ({ patient: { id: 'patient-uuid' }, isLoading: false, error: null }),
  launchWorkspace2: (...args: Array<unknown>) => launchWorkspace2Mock(...args),
  ExtensionSlot: ({ name, state }: { name: string; state?: Record<string, unknown> }) => {
    capturedSlotStates[name] = state;
    return <div data-testid="extension-slot" data-slot-name={name} />;
  },
}));

vi.mock('./current-visit.resource', () => ({
  useVisit: vi.fn().mockReturnValue({
    visit: {
      visitType: { display: 'Visit Type' },
      encounters: [],
    },
    error: null,
    isLoading: false,
  }),
}));

const patientUuid = mockPastVisit.data.results[0].patient.uuid;
const visitUuid = mockPastVisit.data.results[0].uuid;

const vitalsSlotName = 'service-queues-current-visit-vitals-slot';
const visitSummarySlotName = 'service-queues-visit-summary-slot';

describe('CurrentVisit', () => {
  beforeEach(() => {
    launchWorkspace2Mock.mockClear();
    for (const key of Object.keys(capturedSlotStates)) {
      delete capturedSlotStates[key];
    }
  });

  it('renders visit details correctly', async () => {
    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Visit Type')).toBeInTheDocument();
    expect(screen.getByText('Scheduled for today')).toBeInTheDocument();
    expect(screen.getByText('On time')).toBeInTheDocument();
  });

  it('mounts the vitals and visit-summary slots and wires the vitals form launcher', async () => {
    const visit = { visitType: { display: 'Visit Type' }, encounters: [] };
    useVisitMock.mockReturnValue({
      visit: visit as any,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    const slotNames = screen.getAllByTestId('extension-slot').map((slot) => slot.getAttribute('data-slot-name'));
    expect(slotNames).toContain(vitalsSlotName);
    expect(slotNames).toContain(visitSummarySlotName);

    // The visit-summary slot receives the visit and patient uuid it renders from.
    expect(capturedSlotStates[visitSummarySlotName]).toMatchObject({ visit, patientUuid });

    // The vitals slot owns the only surviving authoring path; it must receive a launcher callback
    // that opens the queue's patient vitals workspace.
    const vitalsState = capturedSlotStates[vitalsSlotName];
    expect(typeof vitalsState.launchCustomVitalsForm).toBe('function');
    vitalsState.launchCustomVitalsForm();
    expect(launchWorkspace2Mock).toHaveBeenCalledWith(
      serviceQueuesPatientVitalsWorkspace,
      expect.objectContaining({ patientUuid, visitContext: visit }),
    );
  });

  it('renders a loading skeleton when fetching data', async () => {
    useVisitMock.mockReturnValue({
      visit: null,
      error: null,
      isLoading: true,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders a fallback when visit uuid is missing', async () => {
    useVisitMock.mockReturnValue({
      visit: null,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<CurrentVisit patientUuid={patientUuid} />);

    expect(useVisitMock).toHaveBeenCalledWith(undefined);
    expect(screen.getByText('No active visit')).toBeInTheDocument();
  });

  it('renders a fallback when visit data is unavailable', async () => {
    useVisitMock.mockReturnValue({
      visit: null,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.getByText('No active visit')).toBeInTheDocument();
  });
});
