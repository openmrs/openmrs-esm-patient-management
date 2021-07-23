import {
  PatientListBase,
  PatientListDetails,
  PatientListMember,
  PatientListOption,
  PATIENT_LIST_TYPE,
  PatientListMemberFilter,
} from './types';

function sleep(time: number) {
  return new Promise<void>((res) => setTimeout(() => res(), time));
}

export function newUuid() {
  return Math.random().toString(36).split('.')[1] + Math.random().toString(36).split('.')[1];
}

export function exist(...args: any[]): boolean {
  for (const y of args) {
    if (y === null || y === undefined) {
      return false;
    }
  }

  return true;
}

const DELAY = 300;

type PatientUuid = string;
type PatientListUuid = string;

const patientLists = new Map<PatientListUuid, PatientListDetails>();

const patientListMembers = new Map<string, Array<PatientListMember>>();

// use async iterator for pagination?
export function getAllPatientLists(filter?: PATIENT_LIST_TYPE, stared?: boolean, nameFilter?: string) {
  return sleep(DELAY).then(() => {
    const res: Array<PatientListBase> = [];

    for (const pl of patientLists.values()) {
      if (exist(filter) && filter !== pl.type) continue;
      if (exist(stared) && stared !== pl.isStarred) continue;
      if (exist(nameFilter) && !pl.display.includes(nameFilter)) continue;

      res.push(pl);
    }
    return res;
  });
}

// might be directly part of getAllPatientLists, depends on how options are fetched
export function getPatientListDetails(listUuid: PatientListUuid) {
  return sleep(DELAY).then(() => patientLists.get(listUuid)) as Promise<PatientListDetails>;
}

// when adding a patient to new lists, we need to know which lists the patient is already on
export function getAllPatientListsWithPatient(
  patientUuid: PatientUuid,
  filter?: PATIENT_LIST_TYPE,
  stared?: boolean,
  nameFilter?: string,
) {
  return sleep(DELAY).then(() => {
    const res: Array<PatientListDetails> = [];

    for (const pl of patientLists.values()) {
      if (exist(filter) && filter !== pl.type) continue;
      if (exist(stared) && stared !== pl.isStarred) continue;
      if (exist(nameFilter) && !pl.display.includes(nameFilter)) continue;
      if (!patientListMembers.get(pl.uuid).find((patient) => patient.patientUuid === patientUuid)) continue;

      res.push(pl);
    }

    return res;
  });
}

export function getPatientListMembers(listUuid: PatientListUuid, filters?: Array<PatientListMemberFilter>) {
  return sleep(DELAY).then(() => patientListMembers.get(listUuid)) as Promise<Array<PatientListMember>>;
}

export function createPatientList(
  name: string,
  description: string,
  type = PATIENT_LIST_TYPE.USER,
  options?: Array<PatientListOption>,
) {
  return sleep(DELAY).then(() => {
    const uuid = newUuid();
    patientLists.set(uuid, {
      display: name,
      description: '',
      isStarred: false,
      type,
      uuid,
      memberCount: 0,
      options,
    });

    patientListMembers.set(uuid, []);

    return uuid;
  });
}

export function updatePatientListDetails(
  listUuid: PatientListUuid,
  details: Omit<Partial<PatientListDetails>, 'uuid'>,
) {
  return sleep(DELAY).then(() => {
    const patientList = patientLists.get(listUuid);

    if (!patientList) {
      throw new Error('list does not exist');
    }

    patientLists.set(listUuid, {
      ...patientList,
      ...details,
    });
  });
}

export function deletePatientList(uuid: PatientListUuid) {
  return sleep(DELAY).then(() => {
    patientLists.delete(uuid);
    patientListMembers.delete(uuid);
  });
}

export function addPatientToPatientList(patientUuid: PatientUuid, listUuid: PatientListUuid) {
  return sleep(DELAY).then(() => {
    const members = patientListMembers.get(listUuid);

    if (!members) {
      throw new Error('list does not exist');
    }

    members.push({
      patientUuid,
      properties: [],
    });

    patientLists.get(listUuid).memberCount++;
  });
}

export function deletePatientFromPatientList(patientUuid: PatientUuid, listUuid: PatientListUuid) {
  return sleep(DELAY).then(() => {
    const members = patientListMembers.get(listUuid);
    const toBeDeleted = members.findIndex((x) => x.patientUuid === patientUuid);

    if (toBeDeleted !== -1) {
      members.splice(toBeDeleted, 1);
      patientLists.get(listUuid).memberCount--;
    }
  });
}
