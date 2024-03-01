import useSWR from 'swr';
import { useSession, type Visit, openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import dayjs from 'dayjs';
import { useAppointmentDate } from '../helpers';

/**
 * Custom hook to fetch visits from the OpenMRS REST API.
 * This fetches all visits that started on the currently selected date and are associated with the current session location.
 * @returns An object containing the visits, isLoading flag, and error message.
 */
export const useVisits = () => {
  const { currentAppointmentDate } = useAppointmentDate();
  const session = useSession();

  const visitsUrl = `${restBaseUrl}/visit?includeInactive=true&includeParentLocations=true&v=custom:(uuid,patient:(uuid,identifiers:(identifier,uuid),person:(age,display,gender,uuid)),visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,stopDatetime)&fromStartDate=${dayjs(
    currentAppointmentDate,
  ).format('YYYY-MM-DD')}&toStartDate=${dayjs(currentAppointmentDate)
    .add(1, 'day')
    .format('YYYY-MM-DD')}&location=${session?.sessionLocation?.uuid}`;

  const { data, error, isLoading, mutate } = useSWR<{ data: { results: Visit[] } }>(visitsUrl, openmrsFetch);
  const visits = data?.data?.results ?? [];

  return { isLoading, visits, error, mutateVisit: mutate };
};
