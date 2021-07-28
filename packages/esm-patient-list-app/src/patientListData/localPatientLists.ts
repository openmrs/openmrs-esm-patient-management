import { isOfflineUuid, offlineUuidPrefix } from '@openmrs/esm-framework';
import Dexie, { Table } from 'dexie';
import {
  PatientList,
  PatientListMember,
  PatientListMemberFilter,
  PatientListUpdate,
  PatientListType,
  PatientListFilter,
} from './types';

/**
 * A basic template of those patient lists that are known to be stored on the user's local device.
 * These values are, when modified by the user, enriched with metadata stored in an IndexedDB.
 */
const knownLocalPatientListTemplates: Array<PatientList> = [
  {
    id: `${offlineUuidPrefix}l0c4l000-5240-4b9b-b5d6-000000000001`,
    display: 'Offline Patients',
    description: 'Patients available while offline.',
    isStarred: false,
    memberCount: 0,
    type: PatientListType.USER,
  },
];

/**
 * Returns all patient lists of the given user stored locally on the user's device.
 * @param userId The ID of the user whose patient list information should be retrieved.
 */
export async function getAllDeviceLocalPatientLists(userId: string, filter: PatientListFilter = {}) {
  // TODO: Apply filtering.
  const allMetadata = await new PatientListDb().patientListMetadata.where({ userId }).toArray();
  const patientLists = knownLocalPatientListTemplates.map((defaultEntry) => {
    const relatedMetadata = allMetadata.find((metadata) => metadata.patientListId === defaultEntry.id);
    return {
      ...defaultEntry,
      isStarred: relatedMetadata?.isStarred ?? defaultEntry.isStarred,
      memberCount: relatedMetadata?.members.length ?? defaultEntry.memberCount,
    };
  });

  return patientLists.filter(
    (patientList) =>
      (filter.name === undefined || patientList.display.toLowerCase().includes(filter.name.toLowerCase())) &&
      (filter.isStarred === undefined || patientList.isStarred === filter.isStarred) &&
      (filter.type === undefined || patientList.type == filter.type),
  );
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
export async function updateDeviceLocalPatientList(userId: string, patientListId: string, update: PatientListUpdate) {
  ensureIsLocalPatientList(patientListId);

  const db = new PatientListDb();
  const initialMetadata = (await db.patientListMetadata.where({ userId, patientListId }).first()) ?? {
    userId,
    patientListId,
    isStarred: false,
    members: [],
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
    this.version(2).stores({ patientListMetadata: '++id,&[userId+patientListId]' });
    this.patientListMetadata = this.table('patientListMetadata');
  }
}

interface LocalPatientListMetadata {
  id?: number;
  userId: string;
  patientListId: string;
  isStarred: boolean;
  members: Array<PatientListMember>;
}
