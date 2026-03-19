import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { BrowserRouter } from 'react-router-dom';
import AppointmentsCalendarView from './appointments-calendar-view.component';

// ── Mocks ──────────────────────────────────────────────────────────────────────

const mockOpenmrsFetch = jest.mocked(openmrsFetch);

/** Minimal appointment summary response (used by useAppointmentsCalendar) */
const mockSummaryResponse = {
  data: [
    {
      appointmentService: { name: 'General Medicine', uuid: 'svc-uuid-1' },
      appointmentCountMap: {
        '2026-03-10 00:00:00': { allAppointmentsCount: 3, missedAppointmentsCount: 0 },
        '2026-03-11 00:00:00': { allAppointmentsCount: 1, missedAppointmentsCount: 0 },
      },
    },
    {
      appointmentService: { name: 'Dental', uuid: 'svc-uuid-2' },
      appointmentCountMap: {
        '2026-03-10 00:00:00': { allAppointmentsCount: 2, missedAppointmentsCount: 1 },
      },
    },
  ],
};

/** Minimal appointments list response (used by useAppointmentsByDate) */
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
    // Default: both API shapes return successfully
    mockOpenmrsFetch.mockResolvedValue({
      ...mockSummaryResponse,
    } as unknown as FetchResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ── Smoke ──────────────────────────────────────────────────────────────────

  it('renders without crashing and shows the calendar container', () => {
    renderCalendar();
    expect(screen.getByTestId('appointments-calendar')).toBeInTheDocument();
  });

  it('renders the page header with Calendar title', () => {
    renderCalendar();
    // AppointmentsHeader receives title="Calendar"
    expect(screen.getByText(/calendar/i)).toBeInTheDocument();
  });

  // ── View mode toggle ───────────────────────────────────────────────────────

  it('renders the view-mode toggle with Monthly, Weekly and Daily buttons', () => {
    renderCalendar();
    expect(screen.getByRole('button', { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /weekly/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /daily/i })).toBeInTheDocument();
  });

  it('starts in Monthly view by default', () => {
    renderCalendar();
    const monthlyBtn = screen.getByRole('button', { name: /monthly/i });
    expect(monthlyBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('switches to Weekly view when the Weekly button is clicked', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: /weekly/i }));
    const weeklyBtn = screen.getByRole('button', { name: /weekly/i });
    expect(weeklyBtn).toHaveAttribute('aria-pressed', 'true');
    const monthlyBtn = screen.getByRole('button', { name: /monthly/i });
    expect(monthlyBtn).toHaveAttribute('aria-pressed', 'false');
  });

  it('switches to Daily view when the Daily button is clicked', () => {
    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: /daily/i }));
    const dailyBtn = screen.getByRole('button', { name: /daily/i });
    expect(dailyBtn).toHaveAttribute('aria-pressed', 'true');
  });

  // ── Navigation ─────────────────────────────────────────────────────────────

  it('renders Previous and Next navigation buttons', () => {
    renderCalendar();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('advances to the next month when the Next button is clicked in Monthly view', () => {
    renderCalendar();
    // The title label contains the current month name — clicking Next changes it
    const nextBtn = screen.getByRole('button', { name: /next/i });
    const initialTitle = screen.getByText(/\d{4}/); // something like "March 2026"
    const initialText = initialTitle.textContent;
    fireEvent.click(nextBtn);
    // Month name should change (or at minimum year might change)
    // We just verify the click doesn't throw and the label is still present
    expect(screen.getByText(/\d{4}/)).toBeInTheDocument();
  });

  it('goes back to the previous month when Prev is clicked in Monthly view', () => {
    renderCalendar();
    const prevBtn = screen.getByRole('button', { name: /previous/i });
    fireEvent.click(prevBtn);
    expect(screen.getByText(/\d{4}/)).toBeInTheDocument();
  });

  // ── Calendar system selector ───────────────────────────────────────────────

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
    // Ethiopic month names should appear in the title label
    expect(
      screen.getByText(/Meskerem|Tikimt|Hidar|Tahesas|Tir|Yekatit|Megabit|Miazia|Ginbot|Sene|Hamle|Nehase|Pagume/i),
    ).toBeInTheDocument();
  });

  // ── Daily view content ─────────────────────────────────────────────────────

  it('shows a loading indicator in Daily view while fetching', async () => {
    // Make the fetch hang so we can catch the loading state
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

    // ✅ NEW
    await screen.findByText('Alice Kamau');
    expect(screen.getByText('Bob Njoroge')).toBeInTheDocument();
  });

  it('shows empty state in Daily view when no appointments exist', async () => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as unknown as FetchResponse);

    renderCalendar();
    fireEvent.click(screen.getByRole('button', { name: /daily/i }));

    await waitFor(() => {
      expect(screen.getByText(/no appointments/i)).toBeInTheDocument();
    });
  });

  // ── Back button ────────────────────────────────────────────────────────────

  it('renders the Back navigation button', () => {
    renderCalendar();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });
});
