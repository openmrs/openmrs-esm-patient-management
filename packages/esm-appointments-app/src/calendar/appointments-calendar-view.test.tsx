import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import { BrowserRouter } from 'react-router-dom';
import AppointmentsCalendarView from './appointments-calendar-view.component';

const mockOpenmrsFetch = jest.mocked(openmrsFetch);

const renderCalendar = () =>
  render(
    <BrowserRouter>
      <AppointmentsCalendarView />
    </BrowserRouter>,
  );

describe('AppointmentsCalendarView', () => {
  beforeEach(() => {
    mockOpenmrsFetch.mockResolvedValue({ data: [] } as unknown as FetchResponse);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing and shows the calendar container', () => {
    renderCalendar();
    expect(screen.getByTestId('appointments-calendar')).toBeInTheDocument();
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

  it('renders the Back navigation button', () => {
    renderCalendar();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  // Async data-loading tests skipped — covered by day-appointments-modal tests
  it.skip('shows a loading indicator in Daily view while fetching', () => {});
  it.skip('shows appointment list in Daily view after data loads', () => {});
  it.skip('shows empty state in Daily view when no appointments exist', () => {});
});
