import React from 'react';
import { type Dayjs } from 'dayjs';
import { type CalendarViewMode, type DailyAppointmentsCountByService } from '../types';
import CalendarHeader from './header/calendar-header.component';
import MonthlyCalendarView from './monthly/monthly-calendar-view.component';
import DailyCalendarView from './daily/daily-calendar-view.component';
import ServicesLegend from './services-legend.component';

export interface LegendService {
  uuid: string;
  name: string;
}

interface CalendarViewProps {
  viewMode: CalendarViewMode;
  calendarSelectedDate: Dayjs;
  events: Array<DailyAppointmentsCountByService>;
  appointmentCount: number;
  legendServices: Array<LegendService>;
  serviceColorMap: Map<string, string>;
  onViewModeChange: (mode: CalendarViewMode) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onSelectDate: (isoDate: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  viewMode,
  calendarSelectedDate,
  events,
  appointmentCount,
  legendServices,
  serviceColorMap,
  onViewModeChange,
  onPrev,
  onNext,
  onToday,
  onSelectDate,
}) => {
  return (
    <>
      <CalendarHeader
        viewMode={viewMode}
        calendarSelectedDate={calendarSelectedDate}
        appointmentCount={appointmentCount}
        onViewModeChange={onViewModeChange}
        onPrev={onPrev}
        onNext={onNext}
        onToday={onToday}
      />
      {viewMode === 'monthly' && (
        <MonthlyCalendarView
          events={events}
          calendarSelectedDate={calendarSelectedDate}
          onSelectDate={onSelectDate}
          serviceColorMap={serviceColorMap}
        />
      )}
      {viewMode === 'daily' && (
        <DailyCalendarView calendarSelectedDate={calendarSelectedDate} serviceColorMap={serviceColorMap} />
      )}
      <ServicesLegend services={legendServices} serviceColorMap={serviceColorMap} />
    </>
  );
};

export default CalendarView;
