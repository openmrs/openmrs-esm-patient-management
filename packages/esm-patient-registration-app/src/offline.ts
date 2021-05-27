import { useCurrentPatient } from '@openmrs/esm-react-utils';
import Dexie, { Table } from 'dexie';
import { useEffect, useState } from 'react';
import FormManager from './patient-registration/form-manager';
import {
  CapturePhotoProps,
  FormValues,
  PatientIdentifierType,
  PatientUuidMapType,
} from './patient-registration/patient-registration-types';

export async function syncAddedPatients(abortController: AbortController) {
  const db = new PatientRegistrationDb();
  const queuedPatients = await db.patientRegistrations.toArray();

  if (queuedPatients.length > 0) {
    await Promise.all(
      queuedPatients.map((queuedPatient) => syncSinglePatientRegistration(queuedPatient, abortController)),
    );
  }
}

async function syncSinglePatientRegistration(queuedPatient: PatientRegistration, abortController: AbortController) {
  try {
    const newPatientId = await FormManager.savePatientFormOnline(
      queuedPatient.formValues,
      queuedPatient.patientUuidMap,
      queuedPatient.initialAddressFieldValues,
      queuedPatient.identifierTypes,
      queuedPatient.capturePhotoProps,
      queuedPatient.patientPhotoConceptUuid,
      queuedPatient.currentLocation,
      queuedPatient.personAttributeSections,
      abortController,
    );

    await new PatientRegistrationDb().patientRegistrations.delete(queuedPatient.id);
    console.info(`Successfully synced new patient. Its new UUID is: `, newPatientId);
  } catch (e) {
    console.error('Failed to synchronize a patient.', e);
  }
}

export function useCurrentOfflinePatient() {
  const [isLoadingOnlinePatient, patient, patientUuid] = useCurrentPatient();
  const [isLoadingOfflinePatient, setIsLoadingOfflinePatient] = useState(false);
  const [offlinePatient, setOfflinePatient] = useState<fhir.Patient | undefined>(undefined);

  useEffect(() => {
    (async () => {
      if (!isLoadingOnlinePatient && !patient) {
        try {
          setIsLoadingOfflinePatient(true);
          const db = new PatientRegistrationDb();
          const registration = db.patientRegistrations.get(+patientUuid);
          if (!registration) {
            return;
          }

          setOfflinePatient({
            id: patientUuid,
            // TODO: Recreate fhir patient structure from persisted form data.
          });
        } finally {
          setIsLoadingOfflinePatient(false);
        }
      }
    })();
  }, [isLoadingOnlinePatient, patient, patientUuid]);

  return [isLoadingOnlinePatient || isLoadingOfflinePatient, patient || offlinePatient];
}

export class PatientRegistrationDb extends Dexie {
  patientRegistrations: Table<PatientRegistration, number>;

  constructor() {
    super('EsmPatientRegistration');

    this.version(1).stores({
      patientRegistrations: '++id',
    });

    this.patientRegistrations = this.table('patientRegistrations');
  }
}

export interface PatientRegistration {
  id?: number;
  formValues: FormValues;
  patientUuidMap: PatientUuidMapType;
  initialAddressFieldValues: Record<string, any>;
  identifierTypes: Array<PatientIdentifierType>;
  capturePhotoProps: CapturePhotoProps;
  patientPhotoConceptUuid: string;
  currentLocation: string;
  personAttributeSections: any;
}
