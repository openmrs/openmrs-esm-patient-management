import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import DayAppointmentsModal from './day-appointments-modal.component';
import { CALENDAR_SYSTEMS } from '../calendar-systems';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockOpenmrsFetch = jest.mocked(openmrsFetch);

const mockAppointments = [
  {
    uuid: 'appt-1',
    patient: { name: 'Alice Kamau', uuid: 'pt-1', identifier: 'ID001' },
    service: { name: 'General Medicine', uuid: 'svc-1' },
    status: 'Scheduled',
    startDateTime: new Date('2026-03-10T09:00:00').getTime(),
    endDateTime: new Date('2026-03-10T09:30:00').getTime(),
    appointmentKind: 'Scheduled',
    appointmentNumber: '0001',
    comments: '',
    recurring: false,
    voided: false,
    extensions: {},
    teleconsultationLink: null,
    dateAppointmentScheduled: null,
    location: { uuid: 'loc-1', name: 'Clinic A' },
    providers: [],
  },
  {
    uuid: 'appt-2',
    patient: { name: 'Bob Njoroge', uuid: 'pt-2', identifier: 'ID002' },
    service: { name: 'Dental', uuid: 'svc-2' },
    status: 'CheckedIn',
    startDateTime: new Date('2026-03-10T10:00:00').getTime(),
    endDateTime: new Date('2026-03-10T10:30:00').getTime(),
    appointmentKind: 'Scheduled',
    appointmentNumber: '0002',
    comments: '',
    recurring: false,
    voided: false,
    extensions: {},
    teleconsultationLink: null,
    dateAppointmentScheduled: null,
    location: { uuid: 'loc-1', name: 'Clinic A' },
    providers: [],
  },
  {
    uuid: 'appt-3',
    patient: { name: 'Carol Wanjiru', uuid: 'pt-3', identifier: 'ID003' },
    service: { name: 'General Medicine', uuid: 'svc-1' },
    status: 'Missed',
    startDateTime: new Date('2026-03-10T11:00:00').getTime(),
    endDateTime: new Date('2026-03-10T11:30:00').getTime(),
    appointmentKind: 'Scheduled',
    appointmentNumber: '0003',
    comments: '',
    recurring: false,
    voided: false,
    extensions: {},
    teleconsultationLink: null,
    dateAppointmentScheduled: null,
    location: { uuid: 'loc-1', name: 'Clinic A' },
    providers: [],
  },
];

// ── Helper ─────────────────────────────────────────────────────────────────────

const defaultProps = {
  isoDate: '2026-03-10',
  calendarSystem: CALENDAR_SYSTEMS.gregory,
  onClose: jest.fn(),
  onDrillDown: jest.fn(),
};

const renderModal = (props = {}) => render(<DayAppointmentsModal {...defaultProps} {...props} />);

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('DayAppointmentsModal', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockResolvedValue({
      data: mockAppointments,
    } as unknown as FetchResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Rendering ────────────────────────────────────────────────────────────

  it('renders with the correct date label in Gregorian calendar', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText(/march 10, 2026/i)).toBeInTheDocument();
    });
  });

  it('renders with the correct date label when Ethiopic calendar is active', async () => {
    renderModal({ calendarSystem: CALENDAR_SYSTEMS.ethiopic });
    await waitFor(() => {
      // 2026-03-10 in Ethiopic is Megabit 1, 2018
      expect(screen.getByText(/megabit/i)).toBeInTheDocument();
    });
  });

  it('shows loading indicator while fetching', async () => {
    mockOpenmrsFetch.mockImplementation(() => new Promise(() => {}) as unknown as Promise<FetchResponse>);
    renderModal();
    expect(await screen.findByText(/loading appointments/i)).toBeInTheDocument();
  });

  it('shows all appointments after data loads', async () => {
    renderModal();
    await screen.findByText('Alice Kamau');
    expect(screen.getByText('Bob Njoroge')).toBeInTheDocument();
    expect(screen.getByText('Carol Wanjiru')).toBeInTheDocument();
  });

  it('groups appointments by service', async () => {
    renderModal();
    await screen.findByText('General Medicine');
    expect(screen.getByText('Dental')).toBeInTheDocument();
  });

  it('shows total appointment count', async () => {
    renderModal();
    await waitFor(() => {
      expect(screen.getByText(/3 appointment/i)).toBeInTheDocument();
    });
  });

  it('shows empty state when no appointments exist', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as unknown as FetchResponse);
    renderModal();
    await waitFor(() => {
      expect(screen.getByText(/no appointments found/i)).toBeInTheDocument();
    });
  });

  // ── Status filter chips ────────────────────────────────────────────────

  it('renders status filter chips for statuses present in the data', async () => {
    renderModal();
    await screen.findByRole('button', { name: /all/i });
    expect(screen.getByRole('button', { name: /scheduled/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /checkedin/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /missed/i })).toBeInTheDocument();
  });

  it('filters appointments when a status chip is clicked', async () => {
    renderModal();
    await screen.findByText('Alice Kamau');

    // Click "Scheduled" filter — only Alice should be visible
    fireEvent.click(screen.getByRole('button', { name: /^scheduled/i }));

    expect(screen.getByText('Alice Kamau')).toBeInTheDocument();
    expect(screen.queryByText('Bob Njoroge')).not.toBeInTheDocument();
    expect(screen.queryByText('Carol Wanjiru')).not.toBeInTheDocument();
  });

  it('shows all appointments again when All chip is clicked after filtering', async () => {
    renderModal();
    await screen.findByText('Alice Kamau');

    fireEvent.click(screen.getByRole('button', { name: /^scheduled/i }));
    fireEvent.click(screen.getByRole('button', { name: /^all/i }));

    expect(screen.getByText('Alice Kamau')).toBeInTheDocument();
    expect(screen.getByText('Bob Njoroge')).toBeInTheDocument();
    expect(screen.getByText('Carol Wanjiru')).toBeInTheDocument();
  });

  // ── Close behaviour ────────────────────────────────────────────────────

  it('calls onClose when the × button is clicked', async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    const closeBtn = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    // The backdrop is the outermost div with role="dialog"
    const backdrop = screen.getByRole('dialog');
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when ESC key is pressed', async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose when clicking inside the modal container', async () => {
    const onClose = jest.fn();
    renderModal({ onClose });
    await screen.findByText('Alice Kamau');
    fireEvent.click(screen.getByText('Alice Kamau'));
    expect(onClose).not.toHaveBeenCalled();
  });

  // ── Drill-down ─────────────────────────────────────────────────────────

  it('calls onDrillDown with daily mode and the ISO date when Day View is clicked', async () => {
    const onDrillDown = jest.fn();
    renderModal({ onDrillDown });
    const dayViewBtn = screen.getByRole('button', { name: /day view/i });
    fireEvent.click(dayViewBtn);
    expect(onDrillDown).toHaveBeenCalledWith('daily', '2026-03-10');
  });
});
