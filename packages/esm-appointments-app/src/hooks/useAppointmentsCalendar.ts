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
    const serviceUuid = service.appointmentService.uuid;
    Object.entries(service.appointmentCountMap).map(([key, value]) => {
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
  return { isLoading, calendarEvents: results, error };
};

export function evaluateAppointmentCalendarDates(forDate: string, period: string) {
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
export async function refreshAppointmentCalendar(forDate: string, period: string, serviceName: string) {
  const { startDate, endDate } = evaluateAppointmentCalendarDates(forDate, period);
  const url = `${restBaseUrl}/appointment/appointmentSummary?startDate=${startDate}&endDate=${endDate}`;
  try {
    const response = await openmrsFetch(url);
    const data = response?.data || [];
    for (const service of data) {
      if (service.appointmentService?.name === serviceName) {
        for (const [date, value] of Object.entries(service.appointmentCountMap || {})) {
          if (date === forDate) {
            const count =
              value && typeof value === 'object' && 'allAppointmentsCount' in value
                ? value.allAppointmentsCount
                : undefined;
            if (typeof count === 'number') {
              return;
            }
          }
        }
      }
    }
  } catch (error) {
    return;
  }
}

export async function updateAppointmentService(
  uuid: string,
  payload: any,
): Promise<{
  success: boolean;
  data?: any;
  error?: { status: number; message: string; code: string; details?: any };
}> {
  try {
    const existingService = await fetchExistingService(uuid);
    const mergedPayload = buildUpdatePayload(uuid, payload, existingService);
    const cleanPayload = removeEmptyValues(mergedPayload);
    const response = await openmrsFetch(`${restBaseUrl}/appointmentService`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cleanPayload),
    });

    return {
      success: true,
      data: response.data,
    };
  } catch (err) {
    return {
      success: false,
      error: {
        status: err?.response?.status || 500,
        message: err?.message || 'Failed to update appointment service',
        code: 'UPDATE_FAILED',
        details: err?.responseBody || err?.response?.data,
      },
    };
  }
}

async function fetchExistingService(uuid: string): Promise<any> {
  try {
    const response = await openmrsFetch(`${restBaseUrl}/appointmentService?uuid=${uuid}`);
    return response.data || {};
  } catch (err) {
    return {};
  }
}

function buildUpdatePayload(uuid: string, payload: any, existingService: any): any {
  const mergedPayload: any = {
    uuid,
    name: payload.name ?? existingService?.name ?? '',
    startTime: payload.startTime || existingService?.startTime || '',
    endTime: payload.endTime || existingService?.endTime || '',
    durationMins: payload.durationMins ?? existingService?.durationMins ?? null,
    maxAppointmentsLimit: payload.maxAppointmentsLimit ?? existingService?.maxAppointmentsLimit ?? null,
    color: payload.color || existingService?.color || '#e2e2e2',
  };

  if (existingService?.location?.uuid) {
    mergedPayload.locationUuid = existingService.location.uuid;
  }
  if (existingService?.speciality?.uuid) {
    mergedPayload.specialityUuid = existingService.speciality.uuid;
  }
  if (payload.weeklyAvailability?.length > 0) {
    mergedPayload.weeklyAvailability = payload.weeklyAvailability;
  } else if (existingService?.weeklyAvailability?.length > 0) {
    mergedPayload.weeklyAvailability = existingService.weeklyAvailability;
  }
  if (existingService?.serviceTypes?.length > 0) {
    mergedPayload.serviceTypes = existingService.serviceTypes;
  }

  return mergedPayload;
}
function removeEmptyValues(payload: any): any {
  const cleaned = { ...payload };

  Object.keys(cleaned).forEach((key) => {
    const value = cleaned[key];
    if (value === null || value === '' || value === undefined) {
      delete cleaned[key];
    } else if (Array.isArray(value) && value.length === 0) {
      delete cleaned[key];
    }
  });

  return cleaned;
}
export function getMaxAppointmentsLimit(servicePayload: any): number | null {
  if (!servicePayload || typeof servicePayload.maxAppointmentsLimit === 'undefined') {
    return null;
  }
  if (servicePayload.maxAppointmentsLimit === null) {
    return null;
  }
  return Number(servicePayload.maxAppointmentsLimit);
}
