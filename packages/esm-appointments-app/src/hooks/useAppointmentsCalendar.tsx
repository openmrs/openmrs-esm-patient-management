import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { omrsDateFormat } from '../constants';

interface CalendarEvent {
  services: Array<{
    appointmentServiceName: string;
    allAppointmentsCount: number;
    missedAppointmentsCount: number | null;
    appointmentDate: string | null;
  }>;
  appointmentDate: string;
  appointmentService: string;
  appointmentCountMap: OpenmrsResource | null;
  totalServiceCount: number;
}

export const useAppointmentsCalendar = (forDate: string, period: string) => {
  const { startDate, endDate } = evaluateAppointmentCalendarDates(forDate, period);
  const url = `/ws/rest/v1/appointment/appointmentCalendar?startDate=${startDate}&endDate=${endDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<CalendarEvent> }>(
    startDate && endDate ? url : null,
    openmrsFetch,
    { errorRetryCount: 2 },
  );
  const results =
    data?.data.map((event) => ({
      appointmentDate: event.appointmentDate,
      service: event.services.map((s) => ({ serviceName: s.appointmentServiceName, count: s.allAppointmentsCount })),
    })) ?? [];

  return { isLoading, calendarEvents: results, error };
};

function evaluateAppointmentCalendarDates(forDate: string, period: string) {
  if (period === 'daily') {
    return {
      startDate: dayjs(forDate).startOf('day').format(omrsDateFormat),
      endDate: dayjs(forDate).endOf('day').format(omrsDateFormat),
    };
  }

  if (period === 'weekly') {
    return {
      startDate: dayjs(forDate).startOf('week').format(omrsDateFormat),
      endDate: dayjs(forDate).endOf('week').format(omrsDateFormat),
    };
  }

  if (period === 'monthly') {
    return {
      startDate: dayjs(forDate).startOf('month').format(omrsDateFormat),
      endDate: dayjs(forDate).endOf('month').format(omrsDateFormat),
    };
  }
}
