import { openmrsFetch } from '@openmrs/esm-framework';
import { SearchedPatient } from '../types';

const customRepresentation =
  'custom:(patientId,uuid,identifiers,display,' +
  'patientIdentifier:(uuid,identifier),' +
  'person:(gender,age,birthdate,birthdateEstimated,personName,addresses,display,dead,deathDate),' +
  'attributes:(value,attributeType:(name)))';

export function performPatientSearch(query: string, ac: AbortController, includeDead: boolean) {
  const url = `/ws/rest/v1/patient?q=${query}&v=${customRepresentation}&includeDead=${includeDead}`;
  return openmrsFetch(url, {
    method: 'GET',
    signal: ac.signal,
  });
}

export enum ActionTypes {
  searching = 'searching',
  resolved = 'resolved',
  error = 'error',
  idle = 'idle',
}
interface Searching {
  type: ActionTypes.searching;
  payload: Array<SearchedPatient>;
}

interface Error {
  type: ActionTypes.error;
  error: Error;
}
interface Resolved {
  type: ActionTypes.resolved;
  payload: Array<SearchedPatient>;
}

interface Idle {
  type: ActionTypes.idle;
  payload: Array<SearchedPatient>;
}

type Action = Searching | Error | Resolved | Idle;

export interface PatientSearch {
  status: 'searching' | 'resolved' | 'error' | 'idle';
  searchResults: Array<SearchedPatient>;
  error?: null | Error;
}

export function reducer(state: PatientSearch, action: Action): PatientSearch {
  switch (action.type) {
    case ActionTypes.error:
      return { status: action.type, error: action.error, ...state };
    default:
      return { status: action.type, searchResults: action.payload };
  }
}

export const initialState: PatientSearch = { status: 'idle', searchResults: [] };
