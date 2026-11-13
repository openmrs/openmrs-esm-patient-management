import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { getCalendarFormat, getCalendarMonthRange } from '../calendar/calendar-utils';
import { omrsDateFormat } from '../constants';
import { type DailyAppointmentsCountByService } from '../types';

interface AppointmentCountMapEntry {
  allAppointmentsCount: number;
}

interface AppointmentSummaryResponse {
  appointmentService: {
    name: string;
    uuid: string;
  };
  appointmentCountMap: Map<string, AppointmentCountMapEntry>;
}

export const useAppointmentsCalendar = (forDate: string | null, period: string) => {
  const { startDate, endDate } = evaluateAppointmentCalendarDates(forDate, period);
  const url = `${restBaseUrl}/appointment/appointmentSummary?startDate=${startDate}&endDate=${endDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentSummaryResponse> }>(
    startDate && endDate ? url : null,
    openmrsFetch,
    { errorRetryCount: 2 },
  );
  // Transform API response into daily appointment counts grouped by service
  const results: DailyAppointmentsCountByService[] =
    data?.data.reduce((acc: DailyAppointmentsCountByService[], service) => {
      const serviceName = service.appointmentService.name;
      const serviceUuid = service.appointmentService.uuid;
      Object.entries(service.appointmentCountMap).forEach(([key, value]) => {
        const existingEntry = acc.find((entry) => entry.appointmentDate === key);
        if (existingEntry) {
          existingEntry.services.push({ serviceName, serviceUuid, count: value.allAppointmentsCount });
        } else {
          acc.push({
            appointmentDate: key,
            services: [{ serviceName, serviceUuid, count: value.allAppointmentsCount }],
          });
        }
      });
      return acc;
    }, []) ?? [];
  return { isLoading, calendarEvents: results, error };
};

function evaluateAppointmentCalendarDates(forDate: string | null, period: string) {
  if (!forDate) {
    return { startDate: null, endDate: null };
  }

  if (period === 'daily') {
    return {
      startDate: dayjs(forDate).startOf('day').format(omrsDateFormat),
      endDate: dayjs(forDate).endOf('day').format(omrsDateFormat),
    };
  }

  // The month in the calendar the user's locale uses, which need not line up with a Gregorian month
  const { start, end } = getCalendarMonthRange(dayjs(forDate), getCalendarFormat().calendar);
  return {
    startDate: start.startOf('day').format(omrsDateFormat),
    endDate: end.endOf('day').format(omrsDateFormat),
  };
}
