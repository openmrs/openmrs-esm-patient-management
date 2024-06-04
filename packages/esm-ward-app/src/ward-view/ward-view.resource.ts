import { type InstalledBackendModules, type Bed, type BedLayout } from '../types';

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

export function checkIfBedManagementInstalled(data: InstalledBackendModules) {
  if (!data) return false;
  const { results } = data;
  const isBedManagementModuleInstalled = !!results.find((module) => module.uuid == 'bedmanagement');
  return isBedManagementModuleInstalled;
}
