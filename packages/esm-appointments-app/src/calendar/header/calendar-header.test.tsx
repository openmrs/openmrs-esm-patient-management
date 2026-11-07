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
  onViewModeChange: vi.fn(),
  onPrev: vi.fn(),
  onNext: vi.fn(),
};

function renderInCalendarRoute() {
  return render(
    <MemoryRouter initialEntries={['/calendar']}>
      <Routes>
        <Route path="/calendar" element={<CalendarHeader {...defaultProps} />} />
        <Route path="/" element={<div>Appointments dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('CalendarHeader back button', () => {
  it('renders a Back button', () => {
    renderInCalendarRoute();
    expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
  });

  it('navigates to the appointments dashboard instead of going back in history', async () => {
    const user = userEvent.setup();
    renderInCalendarRoute();

    await user.click(screen.getByRole('button', { name: /back/i }));

    expect(await screen.findByText('Appointments dashboard')).toBeInTheDocument();
  });
});
