import React from 'react';
import { vi, describe, it, expect } from 'vitest';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import CalendarHeader from './calendar-header.component';

describe('CalendarHeader component', () => {
  const defaultProps = {
    viewMode: 'monthly' as const,
    calendarSelectedDate: dayjs('2026-07-15'),
    appointmentCount: 16,
    onViewModeChange: vi.fn(),
    onPrev: vi.fn(),
    onNext: vi.fn(),
    onToday: vi.fn(),
  };

  it('renders the header layout with Today, Prev, Next, period title, appointment count, and Month/Week/Day switcher', () => {
    render(<CalendarHeader {...defaultProps} />);

    expect(screen.getByRole('button', { name: /today/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
    expect(screen.getByText('July 2026')).toBeInTheDocument();
    expect(screen.getByText('16 appointments this month')).toBeInTheDocument();

    expect(screen.getByRole('tab', { name: /month/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /week/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /day/i })).toBeInTheDocument();
  });

  it('calls onToday when Today button is clicked', async () => {
    const user = userEvent.setup();
    const onToday = vi.fn();
    render(<CalendarHeader {...defaultProps} onToday={onToday} />);

    await user.click(screen.getByRole('button', { name: /today/i }));
    expect(onToday).toHaveBeenCalledTimes(1);
  });

  it('calls onPrev and onNext when navigation buttons are clicked', async () => {
    const user = userEvent.setup();
    const onPrev = vi.fn();
    const onNext = vi.fn();
    render(<CalendarHeader {...defaultProps} onPrev={onPrev} onNext={onNext} />);

    await user.click(screen.getByRole('button', { name: /previous/i }));
    expect(onPrev).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it('calls onViewModeChange with correct mode when switcher buttons are clicked', async () => {
    const user = userEvent.setup();
    const onViewModeChange = vi.fn();
    render(<CalendarHeader {...defaultProps} onViewModeChange={onViewModeChange} />);

    await user.click(screen.getByRole('tab', { name: /week/i }));
    expect(onViewModeChange).toHaveBeenCalledWith('weekly');

    await user.click(screen.getByRole('tab', { name: /day/i }));
    expect(onViewModeChange).toHaveBeenCalledWith('daily');

    await user.click(screen.getByRole('tab', { name: /month/i }));
    expect(onViewModeChange).toHaveBeenCalledWith('monthly');
  });

  it('sets aria-selected true on the active view switcher tab', () => {
    const { rerender } = render(<CalendarHeader {...defaultProps} viewMode="monthly" />);
    expect(screen.getByRole('tab', { name: /month/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /week/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: /day/i })).toHaveAttribute('aria-selected', 'false');

    rerender(<CalendarHeader {...defaultProps} viewMode="weekly" />);
    expect(screen.getByRole('tab', { name: /month/i })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tab', { name: /week/i })).toHaveAttribute('aria-selected', 'true');

    rerender(<CalendarHeader {...defaultProps} viewMode="daily" />);
    expect(screen.getByRole('tab', { name: /day/i })).toHaveAttribute('aria-selected', 'true');
  });

  describe('Period title formatting', () => {
    it('formats month and year in monthly view', () => {
      render(<CalendarHeader {...defaultProps} viewMode="monthly" calendarSelectedDate={dayjs('2026-07-15')} />);
      expect(screen.getByText('July 2026')).toBeInTheDocument();
    });

    it('formats week date range in weekly view within same month', () => {
      render(<CalendarHeader {...defaultProps} viewMode="weekly" calendarSelectedDate={dayjs('2026-07-15')} />);
      // 2026-07-15 is Wednesday; start of week is Sunday July 12, end is Saturday July 18
      expect(screen.getByText(/Jul 12 – 18, 2026/)).toBeInTheDocument();
    });

    it('formats week date range across different months', () => {
      render(<CalendarHeader {...defaultProps} viewMode="weekly" calendarSelectedDate={dayjs('2026-08-01')} />);
      // 2026-08-01 is Saturday; start is Jul 26, end is Aug 1
      expect(screen.getByText(/Jul 26 – Aug 1, 2026/)).toBeInTheDocument();
    });

    it('formats week date range across different years', () => {
      render(<CalendarHeader {...defaultProps} viewMode="weekly" calendarSelectedDate={dayjs('2026-12-31')} />);
      expect(screen.getByText(/Dec 27, 2026 – Jan 2, 2027/)).toBeInTheDocument();
    });

    it('formats day, month and year in daily view', () => {
      render(<CalendarHeader {...defaultProps} viewMode="daily" calendarSelectedDate={dayjs('2026-07-15')} />);
      expect(screen.getByText(/July 15, 2026/)).toBeInTheDocument();
    });
  });

  describe('Appointment count behavior', () => {
    it('shows "0 appointments this month" in month view when count is 0', () => {
      render(<CalendarHeader {...defaultProps} viewMode="monthly" appointmentCount={0} />);
      expect(screen.getByText('0 appointments this month')).toBeInTheDocument();
    });

    it('shows singular "1 appointment this month" in month view when count is 1', () => {
      render(<CalendarHeader {...defaultProps} viewMode="monthly" appointmentCount={1} />);
      expect(screen.getByText('1 appointment this month')).toBeInTheDocument();
    });

    it('shows plural "N appointments this month" in month view', () => {
      render(<CalendarHeader {...defaultProps} viewMode="monthly" appointmentCount={25} />);
      expect(screen.getByText('25 appointments this month')).toBeInTheDocument();
    });

    it('shows "0 appointments this week" in week view when count is 0', () => {
      render(<CalendarHeader {...defaultProps} viewMode="weekly" appointmentCount={0} />);
      expect(screen.getByText('0 appointments this week')).toBeInTheDocument();
    });

    it('shows singular "1 appointment this week" in week view when count is 1', () => {
      render(<CalendarHeader {...defaultProps} viewMode="weekly" appointmentCount={1} />);
      expect(screen.getByText('1 appointment this week')).toBeInTheDocument();
    });

    it('shows plural "N appointments this week" in week view', () => {
      render(<CalendarHeader {...defaultProps} viewMode="weekly" appointmentCount={8} />);
      expect(screen.getByText('8 appointments this week')).toBeInTheDocument();
    });

    it('shows "N appointments today" when day view is showing today', () => {
      const today = dayjs();
      const { rerender } = render(
        <CalendarHeader {...defaultProps} viewMode="daily" calendarSelectedDate={today} appointmentCount={5} />,
      );
      expect(screen.getByText('5 appointments today')).toBeInTheDocument();

      rerender(<CalendarHeader {...defaultProps} viewMode="daily" calendarSelectedDate={today} appointmentCount={1} />);
      expect(screen.getByText('1 appointment today')).toBeInTheDocument();

      rerender(<CalendarHeader {...defaultProps} viewMode="daily" calendarSelectedDate={today} appointmentCount={0} />);
      expect(screen.getByText('0 appointments today')).toBeInTheDocument();
    });

    it('shows "N appointments on this day" when day view is showing a date other than today', () => {
      const otherDay = dayjs().subtract(3, 'day');
      const { rerender } = render(
        <CalendarHeader {...defaultProps} viewMode="daily" calendarSelectedDate={otherDay} appointmentCount={4} />,
      );
      expect(screen.getByText('4 appointments on this day')).toBeInTheDocument();

      rerender(
        <CalendarHeader {...defaultProps} viewMode="daily" calendarSelectedDate={otherDay} appointmentCount={1} />,
      );
      expect(screen.getByText('1 appointment on this day')).toBeInTheDocument();

      rerender(
        <CalendarHeader {...defaultProps} viewMode="daily" calendarSelectedDate={otherDay} appointmentCount={0} />,
      );
      expect(screen.getByText('0 appointments on this day')).toBeInTheDocument();
    });
  });
});
