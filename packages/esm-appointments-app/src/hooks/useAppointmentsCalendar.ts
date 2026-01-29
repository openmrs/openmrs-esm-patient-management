import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import useSWR from 'swr';
import { omrsDateFormat } from '../constants';
import { type DailyAppointmentsCountByService, type Appointment } from '../types';

export const useAppointmentsCalendar = (forDate: string, period: string) => {
  const { startDate, endDate } = evaluateAppointmentCalendarDates(forDate, period);
  const searchUrl = `${restBaseUrl}/appointments/search`;
  const abortController = new AbortController();

  const fetcher = ([url, startDate, endDate]) =>
    openmrsFetch(url, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        startDate,
        endDate,
      },
    });

  const { data, error, isLoading } = useSWR<{ data: Array<Appointment> }, Error>(
    startDate && endDate ? [searchUrl, startDate, endDate] : null,
    fetcher,
    { errorRetryCount: 2 },
  );

  const results: Array<DailyAppointmentsCountByService> = data?.data
    ? Object.values(
        data.data.reduce(
          (acc, appointment) => {
            const appointmentDate = dayjs(appointment.startDateTime).format('YYYY-MM-DD');
            const serviceName = appointment.service.name;
            const serviceUuid = appointment.service.uuid;

            if (!acc[appointmentDate]) {
              acc[appointmentDate] = {
                appointmentDate,
                services: [],
              };
            }

            const existingService = acc[appointmentDate].services.find((s) => s.serviceUuid === serviceUuid);

            if (existingService) {
              existingService.count++;
            } else {
              acc[appointmentDate].services.push({
                serviceName,
                serviceUuid,
                count: 1,
              });
            }

            return acc;
          },
          {} as Record<string, DailyAppointmentsCountByService>,
        ),
      )
    : [];

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
