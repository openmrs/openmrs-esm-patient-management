import { isOfflineUuid, offlineUuidPrefix } from '@openmrs/esm-framework';
import Dexie, { Table } from 'dexie';
import { PatientList, PatientListMember, PatientListUpdate, PatientListType, PatientListFilter } from '.';
import uniqBy from 'lodash-es/uniqBy';

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
export async function getAllLocalPatientLists(
  userId: string,
  filter: PatientListFilter = {},
): Promise<Array<PatientList>> {
  const allMetadata = await findAllPatientListMetadata(userId);
  const patientLists = allMetadata.map(enrichMetadataWithPatientListTemplate);

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
  const metadata = await findFirstPatientListMetadata(userId, patientListId);
  return metadata?.members ?? [];
}

/**
 * Updates the local patient list with the given update values.
 */
export async function updateLocalPatientList(userId: string, patientListId: string, update: PatientListUpdate) {
  ensureIsLocalPatientList(patientListId);

  const db = new PatientListDb();
  const initialMetadata = (await findFirstPatientListMetadata(userId, patientListId, db)) ?? {
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

export async function addPatientToLocalPatientList(userId: string, patientListId: string, patientId: string) {
  ensureIsLocalPatientList(patientListId);

  const db = new PatientListDb();
  const entry = await findFirstPatientListMetadata(userId, patientListId, db);

  entry.members.push({ id: patientId });
  entry.members = uniqBy(entry.members, (x) => x.id);

  await db.patientListMetadata.put(entry);
}

async function findAllPatientListMetadata(userId: string, db = new PatientListDb()) {
  return await db.patientListMetadata.where({ userId }).toArray();
}

async function findFirstPatientListMetadata(userId: string, patientListId: string, db = new PatientListDb()) {
  ensureIsLocalPatientList(patientListId);
  return await db.patientListMetadata.where({ userId, patientListId }).first();
}

function enrichMetadataWithPatientListTemplate(metadata: LocalPatientListMetadata) {
  const patientListTemplate = knownLocalPatientListTemplates.find((template) => template.id === metadata.patientListId);
  return {
    ...patientListTemplate,
    isStarred: metadata.isStarred ?? patientListTemplate.isStarred,
    memberCount: metadata?.members.length ?? patientListTemplate.memberCount,
  };
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
  members: Array<PatientListMemberRef>;
}

interface PatientListMemberRef {
  id: string;
}
