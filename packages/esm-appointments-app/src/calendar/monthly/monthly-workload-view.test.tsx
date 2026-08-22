import React from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import dayjs from 'dayjs';
import { useLayoutType } from '@openmrs/esm-framework';
import MonthlyWorkloadView from './monthly-workload-view.component';
import { type DailyAppointmentsCountByService } from '../../types';

const mockUseLayoutType = vi.mocked(useLayoutType);

beforeEach(() => {
  mockUseLayoutType.mockReturnValue('large-desktop');
});

describe('MonthlyWorkloadView', () => {
  const baseDate = dayjs('2026-06-15');
  const selectedDate = dayjs('2026-06-01');

  const sampleServices = [
    { serviceName: 'Outpatient', serviceUuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90', count: 5 },
    { serviceName: 'HIV Clinic', serviceUuid: '53d58ff1-0c45-4e2e-9bd2-9cc826cb46e1', count: 3 },
    { serviceName: 'TB Clinic', serviceUuid: '4a228e52-0bfe-11ed-861d-0242ac120002', count: 2 },
    { serviceName: 'Cardiology', serviceUuid: 'd9e5a2f1-7c3b-4e8f-a1d6-9b2c4e5f6a7b', count: 4 },
  ];

  const singleApptService = [
    { serviceName: 'Outpatient', serviceUuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90', count: 1 },
  ];

  it('shows total appointment count using "appt" for 1 appointment and "appts" for more than 1', () => {
    const singleEvent: DailyAppointmentsCountByService[] = [
      { appointmentDate: '2026-06-15', services: singleApptService },
    ];

    const { rerender } = render(
      <MonthlyWorkloadView dateTime={baseDate} calendarSelectedDate={selectedDate} events={singleEvent} />,
    );

    expect(screen.getByText('1 appt')).toBeInTheDocument();

    const multipleEvents: DailyAppointmentsCountByService[] = [
      { appointmentDate: '2026-06-15', services: sampleServices },
    ];

    rerender(<MonthlyWorkloadView dateTime={baseDate} calendarSelectedDate={selectedDate} events={multipleEvents} />);

    expect(screen.getByText('14 appts')).toBeInTheDocument();
  });

  it('shows no count and does not open popover on click when a day has no appointments', async () => {
    const user = userEvent.setup();
    render(<MonthlyWorkloadView dateTime={baseDate} calendarSelectedDate={selectedDate} events={[]} />);

    expect(screen.queryByText(/appt/i)).not.toBeInTheDocument();

    const cell = screen.getByTestId('workload-cell-2026-06-15');
    await user.click(cell);
    expect(cell).toHaveAttribute('data-popover-open', 'false');
  });

  it('shows only first few services plus "+N more" button when services exceed max visible', () => {
    const events: DailyAppointmentsCountByService[] = [{ appointmentDate: '2026-06-15', services: sampleServices }];

    render(<MonthlyWorkloadView dateTime={baseDate} calendarSelectedDate={selectedDate} events={events} />);

    const currentData = screen.getByTestId('current-data');
    expect(within(currentData).getByText('Outpatient')).toBeInTheDocument();
    expect(within(currentData).getByText('HIV Clinic')).toBeInTheDocument();
    expect(within(currentData).getByText('TB Clinic')).toBeInTheDocument();
    expect(within(currentData).queryByText('Cardiology')).not.toBeInTheDocument();
    expect(within(currentData).getByText('+1 more')).toBeInTheDocument();
  });

  it('adapts the number of visible services to screen size (2 on small-desktop, 3 on desktop)', () => {
    mockUseLayoutType.mockReturnValue('small-desktop');

    const events: DailyAppointmentsCountByService[] = [{ appointmentDate: '2026-06-15', services: sampleServices }];

    render(<MonthlyWorkloadView dateTime={baseDate} calendarSelectedDate={selectedDate} events={events} />);

    const currentData = screen.getByTestId('current-data');
    expect(within(currentData).getByText('Outpatient')).toBeInTheDocument();
    expect(within(currentData).getByText('HIV Clinic')).toBeInTheDocument();
    expect(within(currentData).queryByText('TB Clinic')).not.toBeInTheDocument();
    expect(within(currentData).getByText('+2 more')).toBeInTheDocument();
  });

  it('lists every service and shows no "+N more" button when showAllServices is true', () => {
    const events: DailyAppointmentsCountByService[] = [{ appointmentDate: '2026-06-15', services: sampleServices }];

    render(
      <MonthlyWorkloadView
        dateTime={baseDate}
        calendarSelectedDate={selectedDate}
        events={events}
        showAllServices={true}
      />,
    );

    const currentData = screen.getByTestId('current-data');
    expect(within(currentData).getByText('Outpatient')).toBeInTheDocument();
    expect(within(currentData).getByText('HIV Clinic')).toBeInTheDocument();
    expect(within(currentData).getByText('TB Clinic')).toBeInTheDocument();
    expect(within(currentData).getByText('Cardiology')).toBeInTheDocument();
    expect(within(currentData).queryByText(/\+\d+ more/)).not.toBeInTheDocument();
  });

  it('opens details popover when clicking "+N more" and stops event propagation', async () => {
    const user = userEvent.setup();
    const events: DailyAppointmentsCountByService[] = [{ appointmentDate: '2026-06-15', services: sampleServices }];

    render(<MonthlyWorkloadView dateTime={baseDate} calendarSelectedDate={selectedDate} events={events} />);

    const cell = screen.getByTestId('workload-cell-2026-06-15');
    expect(cell).toHaveAttribute('data-popover-open', 'false');

    await user.click(screen.getByText('+1 more'));
    expect(cell).toHaveAttribute('data-popover-open', 'true');
  });

  it('popover lists every service with its count, and close button dismisses it', async () => {
    const user = userEvent.setup();
    const events: DailyAppointmentsCountByService[] = [{ appointmentDate: '2026-06-15', services: sampleServices }];

    render(<MonthlyWorkloadView dateTime={baseDate} calendarSelectedDate={selectedDate} events={events} />);

    const cell = screen.getByTestId('workload-cell-2026-06-15');
    await user.click(screen.getByText('14 appts'));
    expect(cell).toHaveAttribute('data-popover-open', 'true');

    const popoverList = screen.getByTestId('popover-service-list');
    expect(within(popoverList).getByText('Outpatient')).toBeInTheDocument();
    expect(within(popoverList).getByText('HIV Clinic')).toBeInTheDocument();
    expect(within(popoverList).getByText('TB Clinic')).toBeInTheDocument();
    expect(within(popoverList).getByText('Cardiology')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close/i });
    await user.click(closeBtn);

    expect(cell).toHaveAttribute('data-popover-open', 'false');
  });

  it('"Open day view" calls onSelectDate with the selected date and closes popover', async () => {
    const user = userEvent.setup();
    const onSelectDate = vi.fn();
    const events: DailyAppointmentsCountByService[] = [{ appointmentDate: '2026-06-15', services: singleApptService }];

    render(
      <MonthlyWorkloadView
        dateTime={baseDate}
        calendarSelectedDate={selectedDate}
        events={events}
        onSelectDate={onSelectDate}
      />,
    );

    const cell = screen.getByTestId('workload-cell-2026-06-15');
    await user.click(screen.getByText('1 appt'));
    expect(cell).toHaveAttribute('data-popover-open', 'true');

    await user.click(screen.getByRole('button', { name: /open day view/i }));

    expect(onSelectDate).toHaveBeenCalledWith('2026-06-15');
    expect(cell).toHaveAttribute('data-popover-open', 'false');
  });

  it('shows the correct appointments whether provided as lookup-by-date (eventsMap) or plain list (events)', () => {
    const eventsMap = new Map<string, DailyAppointmentsCountByService>([
      ['2026-06-15', { appointmentDate: '2026-06-15', services: singleApptService }],
    ]);

    const { rerender } = render(
      <MonthlyWorkloadView dateTime={baseDate} calendarSelectedDate={selectedDate} events={[]} eventsMap={eventsMap} />,
    );

    expect(screen.getByText('1 appt')).toBeInTheDocument();

    rerender(
      <MonthlyWorkloadView
        dateTime={baseDate}
        calendarSelectedDate={selectedDate}
        events={[{ appointmentDate: '2026-06-15', services: sampleServices }]}
      />,
    );

    expect(screen.getByText('14 appts')).toBeInTheDocument();
  });

  it('applies assigned service colors and renders safely when service has no color assigned', () => {
    const serviceColorMap = new Map([['e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90', '#73A947']]);
    const events: DailyAppointmentsCountByService[] = [{ appointmentDate: '2026-06-15', services: sampleServices }];

    render(
      <MonthlyWorkloadView
        dateTime={baseDate}
        calendarSelectedDate={selectedDate}
        events={events}
        serviceColorMap={serviceColorMap}
      />,
    );

    const serviceArea = screen.getByTestId('service-area-e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90');
    expect(serviceArea.style.backgroundColor).toBeTruthy();

    const swatch = screen.getByTestId('service-swatch-e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90');
    expect(swatch).toHaveStyle({ backgroundColor: '#73A947' });
  });

  it('highlights today and styles dates outside the current month differently', () => {
    const today = dayjs();
    const { rerender } = render(<MonthlyWorkloadView dateTime={today} calendarSelectedDate={today} events={[]} />);

    expect(screen.getByTestId('today-indicator')).toBeInTheDocument();

    const otherMonthDate = dayjs('2026-05-31');
    rerender(<MonthlyWorkloadView dateTime={otherMonthDate} calendarSelectedDate={selectedDate} events={[]} />);

    expect(screen.getByTestId('other-month-day')).toBeInTheDocument();
  });

  it('aligns popover appropriately depending on grid index position', async () => {
    const user = userEvent.setup();
    const events: DailyAppointmentsCountByService[] = [{ appointmentDate: '2026-06-15', services: singleApptService }];

    const renderAndCheckAlignment = async (index: number, expectedAlign: string) => {
      const { unmount } = render(
        <MonthlyWorkloadView dateTime={baseDate} calendarSelectedDate={selectedDate} events={events} index={index} />,
      );
      const cell = screen.getByTestId('workload-cell-2026-06-15');
      expect(screen.getByTestId('popover-container')).toHaveClass(`cds--popover--${expectedAlign}`);

      await user.click(cell);
      expect(cell).toHaveAttribute('data-popover-open', 'true');
      unmount();
    };

    // index 0: top row, left side
    await renderAndCheckAlignment(0, 'bottom-start');
    // index 5: top row, right side
    await renderAndCheckAlignment(5, 'bottom-end');
    // index 14: lower row, left side
    await renderAndCheckAlignment(14, 'top-start');
    // index 19: lower row, right side
    await renderAndCheckAlignment(19, 'top-end');
  });

  it('closes popover when clicking outside of it', async () => {
    const user = userEvent.setup();
    const events: DailyAppointmentsCountByService[] = [{ appointmentDate: '2026-06-15', services: singleApptService }];

    render(<MonthlyWorkloadView dateTime={baseDate} calendarSelectedDate={selectedDate} events={events} />);

    const cell = screen.getByTestId('workload-cell-2026-06-15');
    await user.click(screen.getByText('1 appt'));
    expect(cell).toHaveAttribute('data-popover-open', 'true');

    fireEvent.mouseDown(document.body);
    expect(cell).toHaveAttribute('data-popover-open', 'false');
  });
});
