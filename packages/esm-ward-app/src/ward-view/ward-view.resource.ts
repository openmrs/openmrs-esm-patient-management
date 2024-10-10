import { showNotification, useConfig, type Patient } from '@openmrs/esm-framework';
import type { TFunction } from 'i18next';
import { useMemo } from 'react';
import {
  type PendingItemsElementConfig,
  type ColoredObsTagsElementConfig,
  type IdentifierElementConfig,
  type ObsElementConfig,
  type PatientAddressElementConfig,
  type WardConfigObject,
  type WardDefinition,
  type AdmissionRequestNoteElementConfig,
} from '../config-schema';
import type {
  AdmissionLocationFetchResponse,
  Bed,
  BedLayout,
  InpatientAdmission,
  InpatientRequest,
  WardMetrics,
  WardPatientGroupDetails,
} from '../types';
import { useTranslation } from 'react-i18next';

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

export function getWardMetrics(bedLayouts: BedLayout[], wardPatientGroup: WardPatientGroupDetails): WardMetrics {
  const bedMetrics = {
    patients: '--',
    freeBeds: '--',
    capacity: '--',
  };
  if (bedLayouts == null || bedLayouts.length == 0) return bedMetrics;
  const total = bedLayouts.length;
  const occupiedBeds = bedLayouts.filter((bed) => bed.patients.length > 0);
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
    // TODO: inpatientAdmission is undefined sometimes, why?
    if (inpatientAdmission) {
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
    // TODO: inpatientRequest is undefined sometimes, why?
    if (inpatientRequest) {
      allWardPatientUuids.add(inpatientRequest.patient.uuid);
    }
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

export function useElementConfig(elementType: 'obs', id: string): ObsElementConfig;
export function useElementConfig(elementType: 'patientIdentifier', id: string): IdentifierElementConfig;
export function useElementConfig(elementType: 'patientAddress', id: string): PatientAddressElementConfig;
export function useElementConfig(elementType: 'coloredObsTags', id: string): ColoredObsTagsElementConfig;
export function useElementConfig(elementType: 'pendingItems', id: string): PendingItemsElementConfig;
export function useElementConfig(elementType: 'admissionRequestNote', id: string): AdmissionRequestNoteElementConfig;
export function useElementConfig(elementType, id: string): object {
  const config = useConfig<WardConfigObject>();
  const { t } = useTranslation();

  try {
    return config?.patientCardElements?.[elementType]?.find((elementConfig) => elementConfig?.id == id);
  } catch (e) {
    showNotification({
      title: t('errorConfiguringPatientCard', 'Error configuring patient card'),
      kind: 'error',
      critical: true,
      description: t(
        'errorConfiguringPatientCardMessage',
        'Unable to find configuration for {{elementType}}, id: {{id}}',
        {
          elementType,
          id,
        },
      ),
    });
    return null;
  }
}

export function useWardConfig(locationUuid: string): WardDefinition {
  const { wards } = useConfig<WardConfigObject>();

  const currentWardConfig = useMemo(() => {
    const cardDefinition = wards?.find((wardDef) => {
      return (
        wardDef.appliedTo == null ||
        wardDef.appliedTo?.length == 0 ||
        wardDef.appliedTo.some((criteria) => criteria.location == locationUuid)
      );
    });

    return cardDefinition;
  }, [wards, locationUuid]);

  if (!currentWardConfig) {
    console.warn(
      'No ward card configuration has `appliedTo` criteria that matches the current location. Using the default configuration.',
    );
    return { id: 'default-ward' };
  }

  return currentWardConfig;
}
