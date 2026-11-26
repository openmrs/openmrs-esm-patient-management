import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CalendarHeader from './calendar-header.component';

const defaultProps = {
  viewMode: 'monthly' as const,
  calendarSelectedDate: dayjs('2026-09-28'),
  appointmentsCount: null,
  onViewModeChange: vi.fn(),
  onToday: vi.fn(),
  onPrev: vi.fn(),
  onNext: vi.fn(),
};

function renderCalendarHeader(props = {}) {
  return render(
    <MemoryRouter initialEntries={['/calendar']}>
      <Routes>
        <Route path="/calendar" element={<CalendarHeader {...defaultProps} {...props} />} />
        <Route path="/" element={<div>Appointments dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CalendarHeader', () => {
  it('renders the Back, Today, Previous and Next buttons', () => {
    renderCalendarHeader();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^today$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('navigates to the appointments dashboard when Back is clicked', async () => {
    const user = userEvent.setup();
    renderCalendarHeader();

    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(await screen.findByText('Appointments dashboard')).toBeInTheDocument();
  });

  it('calls custom onBack handler when provided', async () => {
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
});
