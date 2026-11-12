import { useMemo } from 'react';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { omrsDateFormat } from '../constants';
import {
  type Appointment,
  type AppointmentsFetchResponse,
  AppointmentStatus,
  type DailyAppointmentsCountByService,
} from '../types';
import { useAppointmentServices } from './useAppointmentService';

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

const appointmentsSearchUrl = `${restBaseUrl}/appointments/search`;

// The statuses that the appointmentSummary endpoint counts. It also leaves out the appointments of deleted
// services. Appointments found through the search endpoint are counted by the same rules, so that applying a
// location filter does not change what counts as an appointment.
const countedStatuses: Array<string> = [
  AppointmentStatus.REQUESTED,
  AppointmentStatus.SCHEDULED,
  AppointmentStatus.CHECKEDIN,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.MISSED,
];

export const useAppointmentsCalendar = (forDate: string | null, period: string, locationUuids?: Array<string>) => {
  const { startDate, endDate } = evaluateAppointmentCalendarDates(forDate, period);
  const hasDateRange = Boolean(startDate && endDate);
  const isFilteredByLocation = locationUuids?.length > 0;
  const { serviceTypes: activeServices, isLoading: isLoadingServices } = useAppointmentServices();
  const url = `${restBaseUrl}/appointment/appointmentSummary?startDate=${startDate}&endDate=${endDate}`;

  const { data, error, isLoading } = useSWR<{ data: Array<AppointmentSummaryResponse> }>(
    hasDateRange && !isFilteredByLocation ? url : null,
    openmrsFetch,
    { errorRetryCount: 2 },
  );

  // The appointmentSummary endpoint does not say where appointments take place, so when a location filter is
  // applied, the appointments themselves are fetched and counted here instead. The API only exposes this
  // search through POST. The selected locations are left out of the key so that changing the selection
  // re-filters the appointments already fetched rather than fetching them again.
  const {
    data: searchData,
    error: searchError,
    isLoading: isSearching,
  } = useSWR<AppointmentsFetchResponse, Error>(
    hasDateRange && isFilteredByLocation ? [appointmentsSearchUrl, startDate, endDate] : null,
    () =>
      openmrsFetch(appointmentsSearchUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { startDate, endDate },
      }),
    { errorRetryCount: 2 },
  );

  const resultsForLocations = useMemo(() => {
    const activeServiceUuids = new Set(activeServices.map((service) => service.uuid));

    return countAppointmentsByDateAndService(
      searchData?.data?.filter(
        (appointment) =>
          locationUuids?.includes(appointment.location?.uuid) &&
          countedStatuses.includes(appointment.status) &&
          activeServiceUuids.has(appointment.service?.uuid),
      ) ?? [],
    );
  }, [searchData?.data, locationUuids, activeServices]);

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

  if (isFilteredByLocation) {
    return { isLoading: isSearching || isLoadingServices, calendarEvents: resultsForLocations, error: searchError };
  }

  return { isLoading, calendarEvents: results, error };
};

function countAppointmentsByDateAndService(appointments: Array<Appointment>): Array<DailyAppointmentsCountByService> {
  const countsByDate = new Map<string, DailyAppointmentsCountByService>();

  appointments.forEach(({ service, startDateTime }) => {
    if (startDateTime == null || !service) {
      return;
    }

    const appointmentDate = dayjs(startDateTime).format('YYYY-MM-DD');
    const dailyCount = countsByDate.get(appointmentDate) ?? { appointmentDate, services: [] };
    const serviceCount = dailyCount.services.find(({ serviceUuid }) => serviceUuid === service.uuid);

    if (serviceCount) {
      serviceCount.count += 1;
    } else {
      dailyCount.services.push({ serviceName: service.name, serviceUuid: service.uuid, count: 1 });
    }

    countsByDate.set(appointmentDate, dailyCount);
  });

  return Array.from(countsByDate.values());
}

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
