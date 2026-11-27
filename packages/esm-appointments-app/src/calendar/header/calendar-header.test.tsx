import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { getDefaultCalendar } from '@openmrs/esm-framework';
import CalendarHeader from './calendar-header.component';

// The framework's test mock has no getDefaultCalendar; leaving it unset falls back to the Gregorian calendar
vi.mock('@openmrs/esm-framework', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getDefaultCalendar: vi.fn(),
}));

const mockGetDefaultCalendar = vi.mocked(getDefaultCalendar);

const defaultProps = {
  viewMode: 'monthly' as const,
  calendarSelectedDate: dayjs('2026-09-28'),
  appointmentsCount: null,
  onViewModeChange: vi.fn(),
  onToday: vi.fn(),
  onPrev: vi.fn(),
  onNext: vi.fn(),
  onBack: vi.fn(),
};

function renderCalendarHeader(props = {}) {
  return render(<CalendarHeader {...defaultProps} {...props} />);
}

describe('CalendarHeader', () => {
  it('renders the Back, Today, Previous and Next buttons', () => {
    renderCalendarHeader();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^today$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('calls onBack when Back is clicked', async () => {
    const user = userEvent.setup();
    const onBack = vi.fn();
    renderCalendarHeader({ onBack });

    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(onBack).toHaveBeenCalled();
  });

  it('renders the Monthly and Daily switcher tabs', () => {
    renderCalendarHeader();
    expect(screen.getByRole('tab', { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /daily/i })).toBeInTheDocument();
  });

  it('shows a Gregorian title when the configured calendar is one the month grid cannot lay out', () => {
    mockGetDefaultCalendar.mockReturnValue('islamic');

    renderCalendarHeader();

    expect(screen.getByText('September 2026')).toBeInTheDocument();
    expect(screen.queryByText(/1448/)).not.toBeInTheDocument();
  });

  it('shows the period in the Ethiopic calendar, without the era, when the locale uses it', () => {
    mockGetDefaultCalendar.mockReturnValue('ethiopic');

    // 28 September 2026 is Meskerem 18, 2019
    const { rerender } = renderCalendarHeader();
    expect(screen.getByText('Meskerem 2019')).toBeInTheDocument();

    rerender(<CalendarHeader {...defaultProps} viewMode="daily" />);
    expect(screen.getByText('Meskerem 18, 2019')).toBeInTheDocument();
  });
});
