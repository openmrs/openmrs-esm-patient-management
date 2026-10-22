import React from 'react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  type Encounter,
  ExtensionSlot,
  formatDate,
  getDefaultsFromConfigSchema,
  launchWorkspace2,
  useConfig,
  usePatient,
} from '@openmrs/esm-framework';
import { mockPastVisit } from '__mocks__';
import { mockPatient } from 'tools';
import {
  serviceQueuesPatientFormEntryWorkspace,
  serviceQueuesPatientVitalsWorkspace,
  serviceQueuesVisitNotesWorkspace,
} from '../constants';
import { type ConfigObject, configSchema } from '../config-schema';
import { type TodaysAppointment, useTodaysAppointments, useVisit } from './current-visit.resource';
import CurrentVisit from './current-visit-summary.component';

const mockUseVisit = vi.mocked(useVisit);
const mockUseTodaysAppointments = vi.mocked(useTodaysAppointments);
const mockUseConfig = vi.mocked(useConfig<ConfigObject>);
const mockUsePatient = vi.mocked(usePatient);
const mockExtensionSlot = vi.mocked(ExtensionSlot);
const mockLaunchWorkspace2 = vi.mocked(launchWorkspace2);

vi.mock('./current-visit.resource', () => ({
  useVisit: vi.fn(),
  useTodaysAppointments: vi.fn(),
}));

const punctualityAttributeTypeUuid = '57ea0cbb-064f-4d09-8cf4-e8228700491c';

const todaysAppointments: Array<TodaysAppointment> = [
  {
    uuid: 'appointment-1',
    status: 'Completed',
    startDateTime: new Date('2026-10-13T09:00:00').getTime(),
    service: { name: 'Laboratory' },
    providers: [{ uuid: 'provider-1', name: 'John Smith', response: 'ACCEPTED' }],
  },
  {
    uuid: 'appointment-2',
    status: 'CheckedIn',
    startDateTime: new Date('2026-10-13T11:00:00').getTime(),
    service: { name: 'General Medicine' },
    providers: [
      { uuid: 'provider-2', name: 'Jane Doe', response: 'ACCEPTED' },
      { uuid: 'provider-3', name: 'Mary Major', response: 'AWAITING' },
      { uuid: 'provider-4', name: 'Ali Khan', response: 'ACCEPTED' },
      { uuid: 'provider-5', name: 'Removed Provider', response: 'CANCELLED' },
      { uuid: 'provider-6', name: null, response: 'ACCEPTED' },
    ],
  },
  {
    uuid: 'appointment-3',
    status: 'Scheduled',
    startDateTime: new Date('2026-10-13T15:00:00').getTime(),
    service: { name: 'Pharmacy' },
    providers: [],
  },
];

const patientUuid = mockPastVisit.data.results[0].patient.uuid;
const visitUuid = mockPastVisit.data.results[0].uuid;
const visit = { visitType: { display: 'Visit Type' }, encounters: [] };

const vitalsSlotName = 'service-queues-current-visit-vitals-slot';
const visitSummarySlotName = 'service-queues-visit-summary-slot';

const getSlotState = (slotName: string) =>
  mockExtensionSlot.mock.calls.map(([props]) => props).find(({ name }) => name === slotName)?.state;

describe('CurrentVisit', () => {
  beforeEach(() => {
    mockUseConfig.mockReturnValue(getDefaultsFromConfigSchema(configSchema) as ConfigObject);
    mockUseTodaysAppointments.mockReturnValue({
      appointments: [],
      hasAppointmentsToday: false,
      error: null,
      isLoading: false,
    });
    mockUsePatient.mockReturnValue({
      patient: mockPatient,
      patientUuid,
      isLoading: false,
      error: null,
    });
    mockUseVisit.mockReturnValue({
      visit: visit as any,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders visit details correctly', async () => {
    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText('Visit Type')).toBeInTheDocument();
    expect(mockUseTodaysAppointments).toHaveBeenCalledWith(patientUuid, [
      'Scheduled',
      'CheckedIn',
      'Completed',
      'Missed',
    ]);
    expect(screen.getByText('No appointments scheduled for today')).toBeInTheDocument();
    expect(screen.queryByText("Today's appointments")).not.toBeInTheDocument();
  });

  it('shows no appointment information while the appointments are loading', async () => {
    mockUseTodaysAppointments.mockReturnValue({
      appointments: todaysAppointments,
      hasAppointmentsToday: true,
      error: null,
      isLoading: true,
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.queryByText("Today's appointments")).not.toBeInTheDocument();
    expect(screen.queryByText('No appointments scheduled for today')).not.toBeInTheDocument();
  });

  it('shows no appointment information when the appointments request fails', async () => {
    mockUseTodaysAppointments.mockReturnValue({
      appointments: todaysAppointments,
      hasAppointmentsToday: true,
      error: new Error('Internal server error'),
      isLoading: false,
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.queryByText("Today's appointments")).not.toBeInTheDocument();
    expect(screen.queryByText('No appointments scheduled for today')).not.toBeInTheDocument();
  });

  it("shows a line for each of today's appointments", async () => {
    const user = userEvent.setup();
    mockUseTodaysAppointments.mockReturnValue({
      appointments: todaysAppointments,
      hasAppointmentsToday: true,
      error: null,
      isLoading: false,
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.getByText("Today's appointments")).toBeInTheDocument();
    expect(screen.getByText(/Completed · Laboratory at .* with John Smith/)).toBeInTheDocument();
    expect(screen.getByText(/Checked in · General Medicine at .* with Ali Khan/)).toBeInTheDocument();
    expect(screen.getByText(/Scheduled · Pharmacy at/)).toBeInTheDocument();
    expect(screen.queryByText(/Pharmacy.*with/)).not.toBeInTheDocument();
    expect(screen.queryByText('No appointments scheduled for today')).not.toBeInTheDocument();

    const moreProviders = screen.getByRole('button', { name: '+2 providers' });
    await user.hover(moreProviders);
    expect(screen.getByText('Jane Doe, Mary Major')).toBeInTheDocument();
    expect(screen.queryByText(/Removed Provider/)).not.toBeInTheDocument();
  });

  it("shows no appointment information when the patient's appointments today all have statuses that are not shown", async () => {
    mockUseTodaysAppointments.mockReturnValue({
      appointments: [],
      hasAppointmentsToday: true,
      error: null,
      isLoading: false,
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.queryByText("Today's appointments")).not.toBeInTheDocument();
    expect(screen.queryByText('No appointments scheduled for today')).not.toBeInTheDocument();
  });

  it('shows no appointment information when no appointment statuses are configured', async () => {
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchema) as ConfigObject),
      appointmentStatuses: [],
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.queryByText("Today's appointments")).not.toBeInTheDocument();
    expect(screen.queryByText('No appointments scheduled for today')).not.toBeInTheDocument();
  });

  it('shows configured visit attributes as tags', async () => {
    // Freeze the clock to the date attribute's day, so that the tag fails if it shows a time for today.
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 13, 10, 0));
    const freeTextAttributeTypeUuid = 'free-text-attribute-type';
    const dateAttributeTypeUuid = 'date-attribute-type';
    const locationAttributeTypeUuid = 'location-attribute-type';
    const emptyAttributeTypeUuid = 'empty-attribute-type';
    mockUseConfig.mockReturnValue({
      ...(getDefaultsFromConfigSchema(configSchema) as ConfigObject),
      visitAttributeTypes: [
        { uuid: punctualityAttributeTypeUuid },
        { uuid: freeTextAttributeTypeUuid },
        { uuid: dateAttributeTypeUuid },
        { uuid: locationAttributeTypeUuid },
        { uuid: emptyAttributeTypeUuid },
      ],
    });
    mockUseVisit.mockReturnValue({
      visit: {
        ...visit,
        attributes: [
          {
            uuid: 'attribute-1',
            attributeType: {
              uuid: punctualityAttributeTypeUuid,
              datatypeClassname: 'org.openmrs.customdatatype.datatype.ConceptDatatype',
            },
            value: { uuid: 'late-concept', display: 'Late' },
          },
          {
            uuid: 'attribute-2',
            attributeType: {
              uuid: 'unconfigured-attribute-type',
              datatypeClassname: 'org.openmrs.customdatatype.datatype.FreeTextDatatype',
            },
            value: 'Not shown',
          },
          {
            uuid: 'attribute-3',
            attributeType: {
              uuid: freeTextAttributeTypeUuid,
              datatypeClassname: 'org.openmrs.customdatatype.datatype.FreeTextDatatype',
            },
            value: 'POL-123',
          },
          {
            uuid: 'attribute-4',
            attributeType: {
              uuid: dateAttributeTypeUuid,
              datatypeClassname: 'org.openmrs.customdatatype.datatype.DateDatatype',
            },
            // Midnight at +14:00 is the previous day in every other timezone, so this fails
            // if the date is read as an instant rather than by its date part.
            value: '2026-10-13T00:00:00.000+1400',
          },
          {
            uuid: 'attribute-5',
            attributeType: {
              uuid: locationAttributeTypeUuid,
              datatypeClassname: 'org.openmrs.customdatatype.datatype.LocationDatatype',
            },
            value: { uuid: 'location-1', display: 'Outpatient Clinic' },
          },
          {
            uuid: 'attribute-6',
            attributeType: {
              uuid: emptyAttributeTypeUuid,
              datatypeClassname: 'org.openmrs.customdatatype.datatype.FreeTextDatatype',
            },
            value: '',
          },
        ],
      } as any,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    const { container } = render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.getByText('Late')).toBeInTheDocument();
    expect(screen.getByText('POL-123')).toBeInTheDocument();
    expect(screen.getByText(formatDate(new Date(2026, 9, 13), { mode: 'wide', time: false }))).toBeInTheDocument();
    expect(screen.getByText('Outpatient Clinic')).toBeInTheDocument();
    expect(screen.queryByText('Not shown')).not.toBeInTheDocument();
    // The configured attribute with an empty value gets no tag. An empty tag has no text or role to query by.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    expect(container.querySelectorAll('.cds--tag')).toHaveLength(4);
  });

  it('mounts the vitals and visit-summary slots and wires the vitals form launcher', async () => {
    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(getSlotState(visitSummarySlotName)).toMatchObject({
      visit,
      patientUuid,
      patient: mockPatient,
      onEditEncounter: expect.any(Function),
      mutateVisitContext: expect.any(Function),
    });

    const vitalsState = getSlotState(vitalsSlotName) as { launchCustomVitalsForm: () => void };
    vitalsState.launchCustomVitalsForm();
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      serviceQueuesPatientVitalsWorkspace,
      expect.objectContaining({ patientUuid, visitContext: visit }),
    );
  });

  it('edits encounters through the queues-owned workspaces rather than the chart-group ones', async () => {
    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    const { onEditEncounter } = getSlotState(visitSummarySlotName) as {
      onEditEncounter: (encounter: Encounter, isVisitNote: boolean) => void;
    };

    // The notes form keys "editing" off the encounter it is handed, so it has to arrive unchanged.
    const noteEncounter: Encounter = { uuid: 'encounter-1', encounterDatetime: '2026-08-12T10:00:00.000+0000' };
    onEditEncounter(noteEncounter, true);
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      serviceQueuesVisitNotesWorkspace,
      expect.objectContaining({ encounter: noteEncounter, formContext: 'editing', patientUuid, visitContext: visit }),
    );

    const form = { uuid: 'form-1' };
    onEditEncounter({ uuid: 'encounter-2', form }, false);
    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(
      serviceQueuesPatientFormEntryWorkspace,
      { form, encounterUuid: 'encounter-2' },
      // The exported form entry workspace reads the patient context from window props, not workspace props.
      expect.objectContaining({ patientUuid, visitContext: visit }),
    );
  });

  it('launches the visit notes workspace from the visit note form button', async () => {
    const user = userEvent.setup();
    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    await user.click(screen.getByRole('button', { name: /visit note form/i }));

    expect(mockLaunchWorkspace2).toHaveBeenCalledWith(serviceQueuesVisitNotesWorkspace, {
      formContext: 'creating',
      patientUuid,
      patient: mockPatient,
      visitContext: visit,
    });
  });

  it('defers the vitals extension and visit note form until the patient has loaded', async () => {
    mockUsePatient.mockReturnValue({
      patient: null,
      patientUuid,
      isLoading: true,
      error: null,
    });

    render(<CurrentVisit patientUuid={patientUuid} visitUuid={visitUuid} />);

    expect(screen.getByRole('button', { name: /visit note form/i })).toBeDisabled();
    // The vitals extension reads `patient` during render, so mounting it early throws into its
    // error boundary. The visit summary only needs the visit, so it still mounts.
    expect(getSlotState(vitalsSlotName)).toBeUndefined();
    expect(getSlotState(visitSummarySlotName)).toMatchObject({ visit, patientUuid });
  });

  it('renders a loading skeleton when fetching data', async () => {
    mockUseVisit.mockReturnValue({
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
    mockUseVisit.mockReturnValue({
      visit: null,
      error: null,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    });

    render(<CurrentVisit patientUuid={patientUuid} />);

    expect(mockUseVisit).toHaveBeenCalledWith(undefined);
    expect(screen.getByText('No active visit')).toBeInTheDocument();
  });

  it('renders a fallback when visit data is unavailable', async () => {
    mockUseVisit.mockReturnValue({
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
