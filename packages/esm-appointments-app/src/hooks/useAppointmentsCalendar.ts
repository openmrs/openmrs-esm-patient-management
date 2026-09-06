import React, { useMemo } from 'react';
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

export const useAppointmentsCalendar = (
  forDate: string | null,
  period: string,
  filters?: { serviceUuids?: string[] },
) => {
  const { startDate, endDate } = evaluateAppointmentCalendarDates(forDate, period);
  const url =
    startDate && endDate
      ? `${restBaseUrl}/appointment/appointmentSummary?startDate=${startDate}&endDate=${endDate}`
      : null;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentSummaryResponse> }>(url, openmrsFetch, {
    errorRetryCount: 2,
  });

  const results: DailyAppointmentsCountByService[] = useMemo(() => {
    if (!data?.data) return [];
    const activeServiceUuids = filters?.serviceUuids;
    return data.data.reduce((acc: DailyAppointmentsCountByService[], service) => {
      const serviceUuid = service.appointmentService.uuid;
      if (activeServiceUuids?.length && !activeServiceUuids.includes(serviceUuid)) {
        return acc;
      }
      const serviceName = service.appointmentService.name;
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
    }, []);
  }, [data?.data, filters?.serviceUuids]);

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

  return {
    startDate: dayjs(forDate).startOf('month').format(omrsDateFormat),
    endDate: dayjs(forDate).endOf('month').format(omrsDateFormat),
  };
}
