import { type Encounter, launchWorkspace2, type Visit } from '@openmrs/esm-framework';
import { serviceQueuesPatientFormEntryWorkspace, serviceQueuesVisitNotesWorkspace } from './constants';

interface EditEncounterContext {
  patient: fhir.Patient;
  patientUuid: string;
  visit: Visit;
  mutateVisit: () => void;
}

/**
 * Builds the `onEditEncounter` handler for the shared `visit-summary` extension. It launches our own
 * registrations of the chart's edit workspaces, since the chart's belong to its `patient-chart` workspace
 * group, which is scoped to chart URLs. The two read the patient context from different places: the visit
 * notes form takes it as workspace props, the form entry workspace as window props.
 */
export function getEditEncounterHandler({ patient, patientUuid, visit, mutateVisit }: EditEncounterContext) {
  return (encounter: Encounter, isVisitNote: boolean) => {
    // Both workspaces need the patient, and a click can land before `usePatient` resolves.
    if (!patient) {
      return;
    }

    if (isVisitNote) {
      launchWorkspace2(serviceQueuesVisitNotesWorkspace, {
        encounter,
        formContext: 'editing',
        patient,
        patientUuid,
        visitContext: visit,
      });
    } else {
      launchWorkspace2(
        serviceQueuesPatientFormEntryWorkspace,
        { form: encounter.form, encounterUuid: encounter.uuid },
        { patient, patientUuid, visitContext: visit, mutateVisitContext: mutateVisit },
      );
    }
  };
}
