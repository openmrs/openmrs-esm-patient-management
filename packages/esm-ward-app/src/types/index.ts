interface Bed {
  id: number;
  uuid: string;
  bedNumber: string;
  bedType: BedType;
  row: number;
  column: number;
  status: BedStatus;
}

interface BedType {
  uuid: string;
  name: string;
  displayName: string;
  description: string;
  resourceVersion: string;
}

type BedStatus = 'AVAILABLE' | 'OCCUPIED';
