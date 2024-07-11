export interface PatientQueueResponse {
  results: Array<PatientQueue>;
}

export interface PatientQueue {
  uuid: string;
  creator: {
    uuid: string;
    display: string;
    username: string;
    systemId: string;
    person: UuidDisplay;
    privileges: [];
    roles: Array<UuidDisplay>;
    retired: boolean;
  };
  dateCreated: string;
  changedBy?: string;
  dateChanged?: string;
  voided: boolean;
  dateVoided: string;
  voidedBy: string;
  patient: {
    uuid: string;
    display: string;
    identifiers: Array<UuidDisplay>;
    person: {
      uuid: string;
      display: string;
      gender: string;
      age: number;
      birthdate: string;
      birthdateEstimated: boolean;
      dead: boolean;
      deathDate?: string;
      causeOfDeath?: string;
      preferredName: UuidDisplay;
      preferredAddress: UuidDisplay;
      attributes: [];
      voided: boolean;
      birthtime?: string;
      deathdateEstimated: boolean;
    };
    voided: boolean;
  };
  provider: {
    uuid: string;
    display: string;
    person: UuidDisplay;
    identifier: string;
    attributes: [];
    retired: boolean;
  };
  locationFrom: QueueLocation;
  locationTo: QueueLocation;
  encounter: {
    uuid: string;
  };
  status: string; // TODO add status enum
  priority: number; // TODO add priority enum
  priorityComment: string;
  visitNumber: string;
  comment: string;
  queueRoom: QueueRoom;
  datePicked: string;
  dateCompleted: string;
}

export interface QueueLocation {
  uuid: string;
  display: string;
  name: string;
  description: string;
  address1?: string;
  address2?: string;
  cityVillage?: string;
  stateProvince?: string;
  country: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  countyDistrict?: string;
  address3?: string;
  address4?: string;
  address5?: string;
  address6?: string;
  tags: Array<UuidDisplay>;
  parentLocation: UuidDisplay;
  childLocations: Array<UuidDisplay>;
  retired: boolean;
  attributes: [];
}

export interface QueueRoom {
  uuid: string;
  display: string;
  name: string;
  description: string;
  address1?: string;
  address2?: string;
  cityVillage?: string;
  stateProvince?: string;
  country?: string;
  postalCode?: string;
  latitude?: string;
  longitude?: string;
  countyDistrict?: string;
  address3?: string;
  address4?: string;
  address5?: string;
  address6?: string;
  tags: Array<UuidDisplay>;
  parentLocation: UuidDisplay;
  childLocations: Array<QueueLocation>;
  retired: boolean;
}

export interface UuidDisplay {
  uuid: string;
  display: string;
}

export interface patientDetailsProps {
  name: string;
  patientUuid: string;
  encounter: {
    uuid: string;
  };
  locationUuid: string;
  locationTo: string;
  locationFrom: string;
  queueUuid: string;
}
