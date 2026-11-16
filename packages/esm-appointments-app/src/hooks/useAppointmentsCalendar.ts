import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR from 'swr';
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

  // Once a month's counts have loaded, even when there are none, a refresh that fails leaves them on screen,
  // so the error is only reported while nothing has loaded
  return { isLoading, calendarEvents: results, error: data ? undefined : error };
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

  return {
    startDate: dayjs(forDate).startOf('month').format(omrsDateFormat),
    endDate: dayjs(forDate).endOf('month').format(omrsDateFormat),
  };
}
