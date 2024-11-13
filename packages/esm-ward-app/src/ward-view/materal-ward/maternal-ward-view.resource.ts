import { showNotification } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useMotherAndChildren, type MothersAndChildrenSearchCriteria } from '../../hooks/useMotherAndChildren';
import { type MotherChildRelationships, type PatientAndAdmission } from '../../types';

const motherAndChildrenRep =
  'custom:(childAdmission,mother:(person,identifiers:full,uuid),child:(person,identifiers:full,uuid),motherAdmission)';

export function useMotherChildrenRelationshipsByPatient(
  allWardPatientUuids: string[],
  fetch: boolean,
): MotherChildRelationships {
  const { t } = useTranslation();

  const getChildrenRequestParams: MothersAndChildrenSearchCriteria = {
    mothers: allWardPatientUuids,
    requireMotherHasActiveVisit: true,
    requireChildHasActiveVisit: true,
    requireChildBornDuringMothersActiveVisit: true,
  };

  const getMotherRequestParams: MothersAndChildrenSearchCriteria = {
    children: allWardPatientUuids,
    requireMotherHasActiveVisit: true,
    requireChildHasActiveVisit: true,
    requireChildBornDuringMothersActiveVisit: true,
  };

  const {
    data: childrenData,
    isLoading: isLoadingChildrenData,
    error: childrenDataError,
  } = useMotherAndChildren(getChildrenRequestParams, fetch && allWardPatientUuids.length > 0, motherAndChildrenRep);
  const {
    data: motherData,
    isLoading: isLoadingMotherData,
    error: motherDataError,
  } = useMotherAndChildren(getMotherRequestParams, fetch && allWardPatientUuids.length > 0, motherAndChildrenRep);

  if (childrenDataError) {
    showNotification({
      title: t('errorLoadingChildren', 'Error loading children info'),
      kind: 'error',
      critical: true,
      description: childrenDataError?.message,
    });
  }
  if (motherDataError) {
    showNotification({
      title: t('errorLoadingMother', 'Error loading mother info'),
      kind: 'error',
      critical: true,
      description: motherDataError?.message,
    });
  }

  const relationships = useMemo(() => {
    const motherByChildUuid = new Map<string, PatientAndAdmission>();
    const childrenByMotherUuid = new Map<string, PatientAndAdmission[]>();
    const isLoading = isLoadingChildrenData || isLoadingMotherData;

    for (const { child, childAdmission, mother, motherAdmission } of motherData ?? []) {
      motherByChildUuid.set(child.uuid, { patient: mother, currentAdmission: motherAdmission });
      if (!childrenByMotherUuid.has(mother.uuid)) {
        childrenByMotherUuid.set(mother.uuid, []);
      }
      childrenByMotherUuid.get(mother.uuid).push({ patient: child, currentAdmission: childAdmission });
    }

    for (const { child, childAdmission, mother, motherAdmission } of childrenData ?? []) {
      motherByChildUuid.set(child.uuid, { patient: mother, currentAdmission: motherAdmission });
      if (!childrenByMotherUuid.has(mother.uuid)) {
        childrenByMotherUuid.set(mother.uuid, []);
      }

      // careful, we need to avoid duplicate entries if both mother and child as in same ward
      const children = childrenByMotherUuid.get(mother.uuid);
      const hasChildAlready = children.some(({ patient }) => patient.uuid == child.uuid);
      if (!hasChildAlready) {
        children.push({ patient: child, currentAdmission: childAdmission });
      }
    }

    return { motherByChildUuid, childrenByMotherUuid, isLoading };
  }, [childrenData, motherData, isLoadingChildrenData, isLoadingMotherData]);

  return relationships;
}
