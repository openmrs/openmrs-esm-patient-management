import { type Concept, type OpenmrsResource } from '@openmrs/esm-framework';

export interface RESTPatientNote extends OpenmrsResource {
  uuid: string;
  display: string;
  encounterDatetime: string;
  encounterType: { name: string; uuid: string };
  encounterProviders: [{ encounterRole: { uuid: string; display: string }; provider: { person: { display: string } } }];
  location: { uuid: string; display: string; name: string };
  obs: Array<ObsData>;
  diagnoses: Array<OpenmrsResource>;
}

export interface PatientNote {
  encounterUuid: string;
  obsUuid: string;
  encounterNote: string;
  encounterNoteRecordedAt: string;
  encounterProvider: string;
  conceptUuid: string;
  encounterTypeUuid: string;
}

export interface UsePatientNotes {
  patientNotes: Array<PatientNote> | null;
  errorFetchingPatientNotes: Error;
  isLoadingPatientNotes: boolean;
  isValidatingPatientNotes?: boolean;
  mutatePatientNotes: () => void;
}

export interface ObsData {
  uuid: string;
  concept: Concept;
  value?: string | any;
  groupMembers?: Array<{
    concept: Concept;
    value?: string | any;
  }>;
  obsDatetime: string;
}
