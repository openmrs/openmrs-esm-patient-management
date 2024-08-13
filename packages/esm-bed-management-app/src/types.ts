import type { KeyedMutator } from 'swr';

export type Tag = {
  uuid: string;
  display: string;
  name: string;
  description?: string;
  retired: boolean;
  links: Array<{
    rel: string;
    uri: string;
    resourceAlias: string;
  }>;
  resourceVersion: string;
};

export type LocationFetchResponse = {
  data: {
    results: Array<Location>;
  };
};

export type Location = {
  uuid: string;
  display: string;
  name: string;
  description: string | null;
  address1: string | null;
  address2: string | null;
  cityVillage: string | null;
  stateProvince: string | null;
  country: string | null;
  postalCode: string | null;
  latitude: string | null;
  longitude: string | null;
  countyDistrict: string | null;
  address3: string | null;
  address4: string | null;
  address5: string | null;
  address6: string | null;
  tags: Tag[];
  parentLocation: Location;
  childLocations: Location[];
  retired: boolean;
  auditInfo: {
    creator: {
      uuid: string;
      display: string;
      links: Array<{
        rel: string;
        uri: string;
        resourceAlias: string;
      }>;
    };
    dateCreated: string;
    changedBy: null;
    dateChanged: null;
  };
  address7: string | null;
  address8: string | null;
  address9: string | null;
  address10: string | null;
  address11: string | null;
  address12: string | null;
  address13: string | null;
  address14: string | null;
  address15: string | null;
  links: Array<{
    rel: string;
    uri: string;
    resourceAlias: string;
  }>;
  resourceVersion: string;
  beds: Bed[];
};

export type BedFetchResponse = {
  results: Array<Bed>;
};

export interface Bed {
  id: number;
  uuid: string;
  bedNumber: string;
  bedType?: BedType;
  row: number;
  column: number;
  status: 'AVAILABLE' | 'OCCUPIED';
}

export interface BedWithLocation extends Bed {
  location: {
    display: string;
    uuid: string;
  };
}

export interface BedType {
  uuid: string;
  name: string;
  displayName: string;
  description: string;
  resourceVersion: string;
}

export interface BedFormData extends BedWithLocation {
  description: string;
}

export interface BedTypeData {
  uuid: string;
  name: string;
  displayName: string;
  description: string;
}

export interface BedTagData {
  uuid: string;
  name: string;
}

export interface BedPostPayload {
  bedNumber: string;
  bedType: string;
  row: number;
  column: number;
  status: string;
  locationUuid: string;
}

export interface BedTagPayload {
  name: string;
}

export interface BedTypePayload {
  name: string;
  displayName: string;
  description: string;
}

export type Mutator = KeyedMutator<{
  data: {
    results: Array<Location>;
  };
}>;

export type AdmissionLocation = {
  ward: {
    uuid: string;
    display: string;
    name: string;
    description: string;
  };
  totalBeds: number;
  occupiedBeds: number;
  bedLayouts: Array<BedDetails>;
};

export type MappedBedData = Array<{
  id: number;
  number: string;
  name: string;
  description: string;
  status: string;
  uuid: string;
}>;

export interface BedDetails extends Bed {
  patient: null | {
    uuid: string;
    identifiers: Array<{ identifier: string }>;
  };
}
