import { launchWorkspace2, type Visit } from '@openmrs/esm-framework';
import { serviceQueuesPatientFormEntryWorkspace, serviceQueuesVisitNotesWorkspace } from './constants';

/**
 * The chart's mapped encounter, which we forward unchanged: the visit notes form treats the presence of `id`
 * as "editing" and reads `rawDatetime`, `obs` and `diagnoses` off it, so reshaping it here would silently
 * turn an edit into a new note.
 */
interface EditableEncounter {
  id: string;
  form?: unknown;
}

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
  return (encounter: EditableEncounter, isVisitNote: boolean) => {
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
        { form: encounter.form, encounterUuid: encounter.id },
        { patient, patientUuid, visitContext: visit, mutateVisitContext: mutateVisit },
      );
    }
  };
}
