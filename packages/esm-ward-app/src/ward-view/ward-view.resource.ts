import { useConfig, type Patient } from '@openmrs/esm-framework';
import type {
  AdmissionLocationFetchResponse,
  Bed,
  BedLayout,
  InpatientAdmission,
  InpatientRequest,
  WardMetrics,
  WardPatientGroupDetails,
} from '../types';
import type { TFunction } from 'i18next';
import { ObsElementDefinition, WardConfigObject } from '../config-schema';

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

export function filterBeds(admissionLocation: AdmissionLocationFetchResponse): BedLayout[] {
  // admissionLocation.bedLayouts can contain row+column positions with no bed,
  // filter out layout positions with no real bed
  let collator = new Intl.Collator([], { numeric: true });
  const bedLayouts = admissionLocation.bedLayouts
    .filter((bl) => bl.bedId)
    .sort((bedA, bedB) => collator.compare(bedA.bedNumber, bedB.bedNumber));
  return bedLayouts;
}

//TODO: This implementation will change when the api is ready
export function getWardMetrics(beds: Bed[], wardPatientGroup: WardPatientGroupDetails): WardMetrics {
  const bedMetrics = {
    patients: '--',
    freeBeds: '--',
    capacity: '--',
  };
  if (beds == null || beds.length == 0) return bedMetrics;
  const total = beds.length;
  const occupiedBeds = beds.filter((bed) => bed.status === 'OCCUPIED');
  const patients = occupiedBeds.length;
  const freeBeds = total - patients;
  const capacity = total != 0 ? Math.trunc((wardPatientGroup.totalPatientsCount / total) * 100) : 0;
  return {
    patients: wardPatientGroup?.totalPatientsCount.toString() ?? '--',
    freeBeds: freeBeds.toString(),
    capacity: capacity.toString(),
  };
}

export function getInpatientAdmissionsUuidMap(inpatientAdmissions: InpatientAdmission[]) {
  const map = new Map<string, InpatientAdmission>();
  for (const inpatientAdmission of inpatientAdmissions ?? []) {
    if (inpatientAdmission) {
      // TODO: why undefined sometimes?
      map.set(inpatientAdmission.patient.uuid, inpatientAdmission);
    }
  }
  return map;
}

export function createAndGetWardPatientGrouping(
  inpatientAdmissions: InpatientAdmission[],
  admissionLocation: AdmissionLocationFetchResponse,
  inpatientRequests: InpatientRequest[],
) {
  const inpatientAdmissionsByPatientUuid = getInpatientAdmissionsUuidMap(inpatientAdmissions);

  const wardAdmittedPatientsWithBed = new Map<string, InpatientAdmission>();
  const wardUnadmittedPatientsWithBed = new Map<string, Patient>();
  const bedLayouts = admissionLocation && filterBeds(admissionLocation);
  const allWardPatientUuids = new Set<string>();

  let wardPatientPendingCount = 0;
  bedLayouts?.map((bedLayout) => {
    const { patients } = bedLayout;
    patients.map((patient) => {
      const patientAdmittedWithBed = inpatientAdmissionsByPatientUuid.get(patient.uuid);
      allWardPatientUuids.add(patient.uuid);
      if (patientAdmittedWithBed) {
        wardAdmittedPatientsWithBed.set(patient.uuid, patientAdmittedWithBed);
        //count the pending metric
        const dispositionType = patientAdmittedWithBed.currentInpatientRequest?.dispositionType;
        if (dispositionType == 'TRANSFER' || dispositionType == 'DISCHARGE') wardPatientPendingCount++;
      } else {
        wardUnadmittedPatientsWithBed.set(patient.uuid, patient);
      }
    });
  });

  const wardUnassignedPatientsList =
    inpatientAdmissions?.filter((inpatientAdmission) => {
      allWardPatientUuids.add(inpatientAdmission.patient.uuid);
      return (
        !wardAdmittedPatientsWithBed.has(inpatientAdmission.patient.uuid) &&
        !wardUnadmittedPatientsWithBed.has(inpatientAdmission.patient.uuid)
      );
    }) ?? [];

  //excluding inpatientRequests
  const totalPatientsCount = allWardPatientUuids.size;

  for (const inpatientRequest of inpatientRequests ?? []) {
    allWardPatientUuids.add(inpatientRequest.patient.uuid);
  }

  return {
    wardAdmittedPatientsWithBed,
    wardUnadmittedPatientsWithBed,
    wardPatientPendingCount,
    bedLayouts,
    wardUnassignedPatientsList,
    allWardPatientUuids,
    totalPatientsCount,
  };
}

export function getWardMetricNameTranslation(name: string, t: TFunction) {
  switch (name) {
    case 'patients':
      return t('patients', 'Patients');
    case 'freeBeds':
      return t('freeBeds', 'Free beds');
    case 'capacity':
      return t('capacity', 'Capacity');
    case 'pendingOut':
      return t('pendingOut', 'Pending out');
  }
}

export function getWardMetricValueTranslation(name: string, t: TFunction, value: string) {
  switch (name) {
    case 'patients':
      return t('patientsMetricValue', '{{ metricValue }}', { metricValue: value });
    case 'freeBeds':
      return t('freeBedsMetricValue', '{{ metricValue }}', { metricValue: value });
    case 'capacity':
      return t('capacityMetricValue', '{{ metricValue }} %', { metricValue: value });
    case 'pendingOut':
      return t('pendingOutMetricValue', '{{ metricValue }}', { metricValue: value });
  }
}

export function useElementConfig(elementType: "obs", id: string): ObsElementDefinition;
export function useElementConfig(elementType, id: string) : ObsElementDefinition{
  const config = useConfig<WardConfigObject>();
  switch(elementType) {
    case "obs" : {
      return config?.patientCardElements?.obs?.find((elementConfig) => elementConfig.id == id);
    }
  }
  return null;
}