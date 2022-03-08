import dayjs from 'dayjs';
import useSWR from 'swr';
import { Visit, openmrsFetch, SessionUser } from '@openmrs/esm-framework';

export interface ActiveVisit {
  location: string;
  name: string;
  patientUuid: string;
  priority: string;
  priorityComment?: string;
  status: string;
  uuid: string;
  visitType: string;
  visitUuid: string;
  waitTime: string;
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
    location: visit?.location?.uuid,
    name: visit?.patient?.person?.display,
    patientUuid: visit?.patient?.uuid,
    priority: '',
    priorityComment: '',
    status: '',
    uuid: visit.uuid,
    visitType: visit?.visitType?.display,
    visitUuid: visit.uuid,
    waitTime: '',
  });

  // Mock data
  const activeVisitLists = [
    {
      name: 'John Test Otieno',
      priority: 'Emergency',
      priorityComment: 'Patient is convulsing and unconscious',
      status: 'Attending triage',
      waitTime: '10',
      uuid: '1',
    },
    {
      name: 'Kennedy Test Kennedy',
      priority: 'Not urgent',
      status: 'Waiting for clinical consultation',
      waitTime: '30',
      uuid: '2',
    },
    {
      name: 'Mose Test Test',
      priority: 'Not urgent',
      status: 'Waiting for triage',
      waitTime: '25',
      uuid: '3',
    },
    {
      name: 'Joo Joo',
      priority: 'Not urgent',
      status: 'Waiting for pharmacy',
      waitTime: '11',
      uuid: '4',
    },
    {
      name: 'Alex Berezinsky Test',
      priority: 'Not urgent',
      status: 'Waiting for triage',
      waitTime: '--',
      uuid: '5',
    },
  ];

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
