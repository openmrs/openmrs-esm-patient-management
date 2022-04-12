import { isOfflineUuid, offlineUuidPrefix, syncOfflinePatientData } from '@openmrs/esm-framework';
import Dexie, { Table } from 'dexie';
import { PatientList, PatientListMember, PatientListUpdate, PatientListType, PatientListFilter } from './types';
import uniqBy from 'lodash-es/uniqBy';

export const offlinePatientListId = `${offlineUuidPrefix}l0c4l000-5240-4b9b-b5d6-000000000001`;

/**
 * A basic template of those patient lists that are known to be stored on the user's local device.
 * These values are, when modified by the user, enriched with metadata stored in an IndexedDB.
 */
const knownLocalPatientListTemplates: Array<PatientList> = [
  {
    id: offlinePatientListId,
    display: 'Offline Patients',
    description: 'Patients available while offline.',
    isStarred: false,
    size: 0,
    type: PatientListType.USER,
  },
];

/**
 * Returns all patient lists of the given user stored locally on the user's device.
 * @param userId The ID of the user whose patient list information should be retrieved.
 */
export async function getAllLocalPatientLists(
  userId: string,
  filter: PatientListFilter = {},
): Promise<Array<PatientList>> {
  const allMetadata = await findAllPatientListMetadata(userId);
  const patientLists = knownLocalPatientListTemplates.map((template) => {
    const associatedMetadata = allMetadata.find((metadata) => metadata.patientListId === template.id);
    return {
      ...template,
      isStarred: associatedMetadata?.isStarred ?? template.isStarred,
      size: associatedMetadata?.members.length ?? template.size,
    };
  });

  return patientLists.filter(
    (patientList) =>
      (filter.name === undefined || patientList.display.toLowerCase().includes(filter.name.toLowerCase())) &&
      (filter.isStarred === undefined || patientList.isStarred === filter.isStarred) &&
      (filter.type === undefined || patientList.type == filter.type),
  );
}

export async function getLocalPatientListIdsForPatient(userId: string, patientId: string): Promise<Array<string>> {
  const allMetadata = await findAllPatientListMetadata(userId);
  const metadataWithPatients = allMetadata.filter((metadata) => metadata.members.some((x) => x.id === patientId));
  return metadataWithPatients.map((metadata) => metadata.patientListId);
}

/**
 * Returns the members of the patient list with the given {@link patientListId} stored locally on the user's device.
 * Returns an empty array if the patient list is not found.
 */
export async function getLocalPatientListMembers(
  userId: string,
  patientListId: string,
): Promise<Array<PatientListMember>> {
  ensureIsLocalPatientList(patientListId);
  const metadata = await getOrCreateMetadataEntry(userId, patientListId);
  return metadata.members ?? [];
}

/**
 * Updates the local patient list with the given update values.
 */
export async function updateLocalPatientList(userId: string, patientListId: string, update: PatientListUpdate) {
  ensureIsLocalPatientList(patientListId);

  const db = new PatientListDb();
  const initialMetadata = await getOrCreateMetadataEntry(userId, patientListId, db);
  const updatedMetadata = {
    ...initialMetadata,
    ...update,
  };

  await db.patientListMetadata.put(updatedMetadata);
}

export async function addPatientToLocalPatientList(userId: string, patientListId: string, patientId: string) {
  ensureIsLocalPatientList(patientListId);

  const db = new PatientListDb();
  const entry = await getOrCreateMetadataEntry(userId, patientListId, db);

  entry.members.push({ id: patientId });
  entry.members = uniqBy(entry.members, (x) => x.id);

  await db.patientListMetadata.put(entry);

  if (patientListId === offlinePatientListId) {
    syncOfflinePatientData(patientId);
  }
}

export async function removePatientFromLocalPatientList(userId: string, patientListId: string, patientId: string) {
  ensureIsLocalPatientList(patientListId);
  const db = new PatientListDb();
  const entry = await getOrCreateMetadataEntry(userId, patientListId, db);
  entry.members = entry.members.filter((x) => x.id !== patientId);
  await db.patientListMetadata.put(entry);
}

async function findAllPatientListMetadata(userId: string, db = new PatientListDb()) {
  return await db.patientListMetadata.where({ userId }).toArray();
}

async function getOrCreateMetadataEntry(userId: string, patientListId: string, db = new PatientListDb()) {
  ensureIsLocalPatientList(patientListId);
  const metadata = await db.patientListMetadata.where({ userId, patientListId }).first();

  if (metadata) {
    return metadata;
  } else {
    const defaultMetadata: LocalPatientListMetadata = {
      userId,
      patientListId,
      isStarred: false,
      members: [],
    };

    await db.patientListMetadata.put(defaultMetadata);
    return defaultMetadata;
  }
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
    super('EsmPatientList');
    this.version(2).stores({ patientListMetadata: '++id,&[userId+patientListId]' });
    this.patientListMetadata = this.table('patientListMetadata');
  }
}

interface LocalPatientListMetadata {
  id?: number;
  userId: string;
  patientListId: string;
  isStarred: boolean;
  members: Array<PatientListMemberRef>;
}

interface PatientListMemberRef {
  id: string;
}
