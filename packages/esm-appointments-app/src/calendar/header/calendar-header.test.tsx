import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import dayjs from 'dayjs';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

function renderCalendarHeader() {
  return render(
    <MemoryRouter>
      <CalendarHeader {...defaultProps} />
    </MemoryRouter>,
  );
}

describe('CalendarHeader', () => {
  it('renders the Today, Previous and Next buttons', () => {
    renderCalendarHeader();
    expect(screen.getByRole('button', { name: /^today$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /previous/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next/i })).toBeInTheDocument();
  });

  it('renders the Monthly and Daily switcher tabs', () => {
    renderCalendarHeader();
    expect(screen.getByRole('tab', { name: /monthly/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /daily/i })).toBeInTheDocument();
  });
});
