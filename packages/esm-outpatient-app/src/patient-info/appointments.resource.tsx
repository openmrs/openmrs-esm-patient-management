import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch } from '@openmrs/esm-framework';
import { AppointmentsFetchResponse } from '../types';

export const appointmentsSearchUrl = `/ws/rest/v1/appointments/search`;

export function useAppointments(patientUuid: string, startDate: string, abortController: AbortController) {
  const fetcher = () =>
    openmrsFetch(appointmentsSearchUrl, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        patientUuid: patientUuid,
        startDate: startDate,
      },
    });

  const appointmentsData = {
    pastAppointments: [
      {
        uuid: 'a4662406-2bfe-49be-8465-6dbdfe9b4d5d',
        appointmentNumber: '0000',
        patient: {
          identifier: '1003R8',
          name: 'Brian Evans',
          uuid: '8f75dbf1-833d-498a-bc99-3a24cad5cee9',
        },
        service: {
          appointmentServiceId: 1,
          name: 'HIV return visit',
          description: null,
          speciality: {},
          startTime: '',
          endTime: '',
          maxAppointmentsLimit: null,
          durationMins: null,
          location: {},
          uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
          color: '#006400',
          initialAppointmentStatus: 'Scheduled',
          creatorName: null,
        },
        serviceType: null,
        provider: null,
        location: {
          name: 'Outpatient Clinic',
          uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
        },
        startDateTime: '2021-10-28T11:14:17.064Z',
        endDateTime: 1649935800000,
        appointmentKind: 'Scheduled',
        status: 'Scheduled',
        comments: null,
        additionalInfo: null,
        teleconsultation: null,
        providers: [],
        voided: false,
        extensions: {
          patientEmailDefined: false,
        },
        teleconsultationLink: null,
        recurring: false.valueOf,
      },
    ],
    upcomingAppointments: [
      {
        uuid: 'a4662406-2bfe-49be-8465-6dbdfe9b4d5d',
        appointmentNumber: '0000',
        patient: {
          identifier: '1003R8',
          name: 'Brian Evans',
          uuid: '8f75dbf1-833d-498a-bc99-3a24cad5cee9',
        },
        service: {
          appointmentServiceId: 1,
          name: 'Clinical observation',
          description: null,
          speciality: {},
          startTime: '',
          endTime: '',
          maxAppointmentsLimit: null,
          durationMins: null,
          location: {},
          uuid: 'e2ec9cf0-ec38-4d2b-af6c-59c82fa30b90',
          color: '#006400',
          initialAppointmentStatus: 'Scheduled',
          creatorName: null,
        },
        serviceType: null,
        provider: null,
        location: {
          name: 'Outpatient Clinic',
          uuid: 'f76c0c8e-2c3a-443c-b26d-96a9f3847764',
        },
        startDateTime: 1649934000000,
        endDateTime: 1649935800000,
        appointmentKind: 'Scheduled',
        status: 'Scheduled',
        comments: null,
        additionalInfo: null,
        teleconsultation: null,
        providers: [],
        voided: false,
        extensions: {
          patientEmailDefined: false,
        },
        teleconsultationLink: null,
        recurring: false.valueOf,
      },
    ],
  };

  const { data, error, isValidating } = useSWR<AppointmentsFetchResponse, Error>(appointmentsSearchUrl, fetcher);

  const appointments = data?.data?.length
    ? data.data.sort((a, b) => (b.startDateTime > a.startDateTime ? 1 : -1))
    : null;

  const pastAppointments = appointments?.filter((appointment) =>
    dayjs((appointment.startDateTime / 1000) * 1000).isBefore(dayjs()),
  );

  const upcomingAppointments = appointments?.filter((appointment) =>
    dayjs((appointment.startDateTime / 1000) * 1000).isAfter(dayjs()),
  );

  return {
    data: appointmentsData,
    isError: error,
    isLoading: !data && !error,
    isValidating,
  };
}
