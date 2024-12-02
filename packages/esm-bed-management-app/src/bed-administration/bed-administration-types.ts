export interface BedAdministrationData {
  bedColumn: string;
  bedId: string;
  bedRow: string;
  bedType: string;
  description: string;
  location: {
    display: string;
    uuid: string;
  };
  occupancyStatus: string;
}

export interface BedTypeDataAdministration {
  description: string;
  displayName: string;
  name: string;
}

export interface BedTagDataAdministration {
  name: string;
}
