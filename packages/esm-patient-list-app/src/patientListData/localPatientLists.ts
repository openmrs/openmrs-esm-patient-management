import { isOfflineUuid, offlineUuidPrefix } from '@openmrs/esm-framework';
import Dexie, { Table } from 'dexie';
import { PatientList, PatientListMember, PatientListMemberFilter, PatientListUpdate, PATIENT_LIST_TYPE } from './types';

/**
 * A basic template of those patient lists that are known to be stored on the user's local device.
 * These values are, when modified by the user, enriched with metadata stored in an IndexedDB.
 */
const knownLocalPatientListTemplates: Array<PatientList> = [
  {
    id: `${offlineUuidPrefix}78e936dc-5240-4b9b-b5d6-6d3351503ab7`,
    display: 'Offline Patients',
    description: 'Patients available while offline.',
    isStarred: false,
    memberCount: 0,
    type: PATIENT_LIST_TYPE.USER,
    isDeviceLocal: true,
  },
];

/**
 * Returns all patient lists stored locally on the user's device.
 */
export async function getAllDeviceLocalPatientLists(
  filter?: PATIENT_LIST_TYPE,
  starred?: boolean,
  nameFilter?: string,
) {
  // TODO: Apply filtering.
  const allMetadata = await new PatientListDb().patientListMetadata.toArray();
  return knownLocalPatientListTemplates.map((defaultEntry) => {
    const relatedMetadata = allMetadata.find((metadata) => metadata.patientListId === defaultEntry.id);
    return {
      ...defaultEntry,
      isStarred: relatedMetadata?.isStarred,
      memberCount: relatedMetadata?.members.length,
    };
  });
}

/**
 * Returns the members of the patient list with the given {@link id} stored locally on the user's device.
 * Returns an empty array if the patient list is not found.
 */
export async function getDeviceLocalPatientListMembers(
  id: string,
  filters?: Array<PatientListMemberFilter>,
): Promise<Array<PatientListMember>> {
  ensureIsLocalPatientList(id);

  // TODO: Apply filtering.
  const metadata = await new PatientListDb().patientListMetadata.where({ patientListId: id }).first();
  return metadata?.members ?? [];
}

/**
 * Updates the local patient list with the given update values.
 */
export async function updateDeviceLocalPatientList(patientListId: string, update: PatientListUpdate) {
  ensureIsLocalPatientList(patientListId);

  const db = new PatientListDb();
  const initialMetadata = (await db.patientListMetadata.where({ patientListId }).first()) ?? {
    isStarred: false,
    members: [],
    patientListId,
  };

  const updatedMetadata = {
    ...initialMetadata,
    ...update,
  };

  await db.patientListMetadata.put(updatedMetadata);
}

function ensureIsLocalPatientList(patientListOrId: string | PatientList) {
  const id = typeof patientListOrId === 'string' ? patientListOrId : patientListOrId.id;

  if (!isOfflineUuid(id)) {
    throw new Error(
      'The given patient list is not a device local patient list. It cannot be accessed with this functions.',
    );
  }
}

class PatientListDb extends Dexie {
  patientListMetadata: Table<LocalPatientListMetadata, number>;

  constructor() {
    super('EsmPatientListLocalPatientLists');
    this.version(1).stores({ patientListMetadata: '++id,&patientListId' });
    this.patientListMetadata = this.table('patientListMetadata');
  }
}

interface LocalPatientListMetadata {
  id?: number;
  patientListId: string;
  isStarred: boolean;
  members: Array<PatientListMember>;
}
