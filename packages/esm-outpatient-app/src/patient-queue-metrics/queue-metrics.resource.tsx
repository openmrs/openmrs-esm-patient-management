import useSWR from 'swr';
import { openmrsFetch, Visit, SessionUser } from '@openmrs/esm-framework';
import dayjs from 'dayjs';

export function useMetrics() {
  const metrics = { scheduled_appointments: 100, average_wait_time: 28, patients_waiting_for_service: 182 };
  const { data, error } = useSWR<{ data: { results: {} } }, Error>(`/ws/rest/v1/queue?`, openmrsFetch);

  return {
    metrics: metrics,
    isError: error,
    isLoading: !data && !error,
  };
}
export interface ActiveVisit {
  id: string;
  priority: string;
  status: string;
  location: string;
  name: string;
  patientUuid: string;
  waitTime: string;
  visitType: string;
  visitUuid: string;
}

export function useActiveVisits() {
  const { data: currentUserSession } = useCurrentSession();
  const sessionLocation = currentUserSession?.data?.sessionLocation?.uuid;
  const startDate = dayjs().format('YYYY-MM-DD');

  const customRepresentation =
    'custom:(uuid,patient:(uuid,person:(age,display,gender,uuid)),' +
    'visitType:(uuid,name,display),location:(uuid,name,display),startDatetime,' +
    'stopDatetime)&fromStartDate=' +
    startDate +
    '&location=' +
    sessionLocation;

  const { data, error, isValidating } = useSWR<{ data: { results: Array<Visit> } }, Error>(
    `/ws/rest/v1/visit?includeInactive=false&v=${customRepresentation}`,
    openmrsFetch,
  );

  const mapVisitProperties = (visit: Visit): ActiveVisit => ({
    id: visit.uuid,
    location: visit?.location?.uuid,
    name: visit?.patient?.person?.display,
    patientUuid: visit?.patient?.uuid,
    visitType: visit?.visitType?.display,
    visitUuid: visit.uuid,
    priority: '',
    waitTime: '',
    status: '',
  });

  // mocked data for active visit list
  const activeVisitLists = [
    {
      name: 'John Test Otieno',
      priority: 'Emergency',
      notes: 'Patient is convulsing and unconscious',
      status: 'Triage',
      waitTime: '20',
      id: '1',
    },
    {
      name: 'Kennedy Test Kennedy',
      priority: 'Priority',
      status: 'Consultation',
      waitTime: '30',
      id: '2',
    },
    {
      name: 'Mose Test Test',
      priority: 'Not urgent',
      status: 'Pharmacy',
      waitTime: '25',
      id: '3',
    },
    {
      name: 'Joo Joo',
      priority: 'Not urgent',
      status: 'Pharmacy',
      waitTime: '11',
      id: '4',
    },
  ];

  const formattedActiveVisits = data?.data?.results.length ? data.data.results.map(mapVisitProperties) : [];

  return {
    activeVisits: activeVisitLists,
    isLoading: !data && !error,
    isError: error,
    isValidating,
  };
}

export function useCurrentSession() {
  const { data, error } = useSWR<{ data: SessionUser }, Error>(`/ws/rest/v1/session`, openmrsFetch);

  return {
    data: data ? data : null,
    isError: error,
  };
}
