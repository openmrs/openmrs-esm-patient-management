import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { BrowserRouter } from 'react-router-dom';
import AppointmentsCalendarView from './appointments-calendar-view.component';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockOpenmrsFetch = jest.mocked(openmrsFetch);

const mockSummaryResponse = {
  data: [
    {
      appointmentService: { name: 'General Medicine', uuid: 'svc-uuid-1' },
      appointmentCountMap: {
        '2026-03-10 00:00:00': { allAppointmentsCount: 3, missedAppointmentsCount: 0 },
      },
    },
  ],
};

const mockAppointmentListResponse = {
  data: [
    {
      uuid: 'appt-uuid-1',
      patient: { name: 'Alice Kamau', uuid: 'pt-1', identifier: 'ID001' },
      service: { name: 'General Medicine', uuid: 'svc-uuid-1' },
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
      uuid: 'appt-uuid-2',
      patient: { name: 'Bob Njoroge', uuid: 'pt-2', identifier: 'ID002' },
      service: { name: 'Dental', uuid: 'svc-uuid-2' },
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
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const renderCalendar = () =>
  render(
    <BrowserRouter>
      <AppointmentsCalendarView />
    </BrowserRouter>,
  );

// ── Tests ──────────────────────────────────────────────────────────────────────

describe('AppointmentsCalendarView', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockResolvedValue({
      ...mockSummaryResponse,
    } as unknown as FetchResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing and shows the calendar container', () => {
    renderCalendar();
    expect(screen.getByTestId('appointments-calendar')).toBeInTheDocument();
  });

  it('renders the page header with Calendar title', () => {
    renderCalendar();
    expect(screen.getByText(/calendar/i)).toBeInTheDocument();
  });

  it('renders the view-mode toggle with Monthly, Weekly and Daily buttons', () => {
    renderCalendar();
    expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /weekly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /daily/i })).toBeInTheDocument();
  });

  it('starts in Monthly view by default', () => {
    renderCalendar();
    expect(screen.getByRole('button', { name: /monthly/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches to Weekly view when the Weekly button is clicked', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: /weekly/i }));
    expect(screen.getByRole('button', { name: /weekly/i })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /monthly/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches to Daily view when the Daily button is clicked', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: /daily/i }));
    expect(screen.getByRole('button', { name: /daily/i })).toHaveAttribute('aria-pressed', 'true');
  });

  it('renders Previous and Next navigation buttons', () => {
    renderCalendar();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('advances to the next month when Next is clicked', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByText(/\d{4}/)).toBeInTheDocument();
  });

  it('goes back when Prev is clicked', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: /previous/i }));
    expect(screen.getByText(/\d{4}/)).toBeInTheDocument();
  });

  it('renders the calendar system selector with Gregorian selected by default', () => {
    renderCalendar();
    const select = screen.getByRole('combobox', { name: /calendar system/i });
    expect(select).toBeInTheDocument();
    expect((select as HTMLSelectElement).value).toBe('gregory');
  });

  it('lists all four supported calendar systems', () => {
    renderCalendar();
    expect(screen.getByRole('option', { name: /gregorian/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /ethiopic/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /islamic/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /persian/i })).toBeInTheDocument();
  });

  it('switches to Ethiopic calendar when selected', () => {
    renderCalendar();
    const select = screen.getByRole('combobox', { name: /calendar system/i });
    fireEvent.change(select, { target: { value: 'ethiopic' } });
    expect((select as HTMLSelectElement).value).toBe('ethiopic');
    expect(
      screen.getByText(/Meskerem|Tikimt|Hidar|Tahesas|Tir|Yekatit|Megabit|Miazia|Ginbot|Sene|Hamle|Nehase|Pagume/i),
    ).toBeInTheDocument();
  });

  it('shows a loading indicator in Daily view while fetching', async () => {
    mockOpenmrsFetch.mockImplementation(() => new Promise(() => {}) as unknown as Promise<FetchResponse>);
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: /daily/i }));
    expect(await screen.findByText(/loading appointments/i)).toBeInTheDocument();
  });

  it('shows appointment list in Daily view after data loads', async () => {
    mockOpenmrsFetch.mockResolvedValue({
      ...mockAppointmentListResponse,
    } as unknown as FetchResponse);
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: /daily/i }));
    expect(await screen.findByText('Alice Kamau')).toBeInTheDocument();
    expect(screen.getByText('Bob Njoroge')).toBeInTheDocument();
  });

  it('shows empty state in Daily view when no appointments exist', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as unknown as FetchResponse);
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: /daily/i }));
    expect(await screen.findByText(/no appointments/i)).toBeInTheDocument();
  });

  it('renders the Back navigation button', () => {
    renderCalendar();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });
});
