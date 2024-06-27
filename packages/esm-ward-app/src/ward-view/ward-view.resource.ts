import type { AdmissionLocation, Bed, BedLayout, WardMetrics } from '../types';

// the server side has 2 slightly incompatible types for Bed
export function bedLayoutToBed(bedLayout: BedLayout): Bed {
  return {
    id: bedLayout.bedId,
    uuid: bedLayout.bedUuid,
    bedNumber: bedLayout.bedNumber,
    bedType: bedLayout.bedType,
    row: bedLayout.rowNumber,
    column: bedLayout.columnNumber,
    status: bedLayout.status,
  };
}

export function filterBeds(admissionLocation: AdmissionLocation): BedLayout[] {
  // admissionLocation.bedLayouts can contain row+column positions with no bed,
  // filter out layout positions with no real bed
  let collator = new Intl.Collator([], { numeric: true });
  const bedLayouts = admissionLocation.bedLayouts
    .filter((bl) => bl.bedId)
    .sort((bedA, bedB) => collator.compare(bedA.bedNumber, bedB.bedNumber));
  return bedLayouts;
}

//TODO: This implementation will change when the api is ready
export function getWardMetrics(beds: Bed[]): WardMetrics {
  const bedMetrics = {
    patients: '--',
    freeBeds: '--',
    capacity: '--',
  };
  if (beds.length == 0) return bedMetrics;
  const total = beds.length;
  const occupiedBeds = beds.filter((bed) => bed.status === 'OCCUPIED');
  const patients = occupiedBeds.length;
  const freeBeds = total - patients;
  const capacity = total != 0 ? Math.trunc((patients / total) * 100) : 0;
  return { patients: patients.toString(), freeBeds: freeBeds.toString(), capacity: capacity.toString() + '%' };
}
