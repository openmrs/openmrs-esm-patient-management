import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { omrsDateFormat } from '../constants';
import { type DailyAppointmentsCountByService } from '../types';
import { useMemo } from 'react';

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

export const useAppointmentsCalendar = (forDate: string, period: string) => {
  const { startDate, endDate } = evaluateAppointmentCalendarDates(forDate, period);
  const url = `${restBaseUrl}/appointment/appointmentSummary?startDate=${startDate}&endDate=${endDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentSummaryResponse> }>(
    startDate && endDate ? url : null,
    openmrsFetch,
    { errorRetryCount: 2 },
  );

  const results: Array<DailyAppointmentsCountByService> = useMemo(() => {
    if (!data?.data) return [];
    const map = new Map<string, DailyAppointmentsCountByService>();
    for (const service of data.data) {
      const { name: serviceName, uuid: serviceUuid } = service.appointmentService;

      for (const [date, value] of Object.entries(service.appointmentCountMap)) {
        if (!map.has(date)) {
          map.set(date, {
            appointmentDate: date,
            services: [],
          });
        }

        map.get(date)?.services.push({
          serviceName,
          serviceUuid,
          count: value.allAppointmentsCount,
        });
      }
    }

    return Array.from(map.values());
  }, [data]);

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
