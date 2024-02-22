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
  };
  appointmentCountMap: Map<string, AppointmentCountMapEntry>;
}

export const useAppointmentsCalendar = (forDate: string, period: string) => {
  const { startDate, endDate } = evaluateAppointmentCalendarDates(forDate, period);
  const url = `${restBaseUrl}/appointment/appointmentSummary?startDate=${startDate}&endDate=${endDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentSummaryResponse> }>(
    startDate && endDate ? url : null,
    openmrsFetch,
    { errorRetryCount: 2 },
  );
  const results: Array<DailyAppointmentsCountByService> = data?.data.reduce((acc, service) => {
    const serviceName = service.appointmentService.name;
    Object.entries(service.appointmentCountMap).map(([key, value]) => {
      const existingEntry = acc.find((entry) => entry.appointmentDate === key);
      if (existingEntry) {
        existingEntry.services.push({ serviceName, count: value.allAppointmentsCount });
      } else {
        acc.push({
          appointmentDate: key,
          services: [{ serviceName, count: value.allAppointmentsCount }],
        });
      }
    });
    return acc;
  }, []);
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
