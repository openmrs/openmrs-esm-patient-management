import { useMemo } from 'react';
import { type MothersAndChildrenSearchCriteria, useMotherAndChildren } from '../../hooks/useMotherAndChildren';
import { type MotherAndChild } from '../../types';
import { showNotification } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

const motherAndChildrenRep =
  'custom:(childAdmission,mother:(person,identifiers:full,uuid),child:(person,identifiers:full,uuid),motherAdmission)';

export function useMotherChildrenRelationshipsByPatient(allWardPatientUuids: string[], fetch: boolean) {
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

  const motherChildrenRelationshipsByPatient = useMemo(() => {
    if (childrenData != null && motherData != null) {
      const map = new Map<string, MotherAndChild[]>();
      for (const data of [...childrenData, ...motherData]) {
        if (!map.has(data.child.uuid)) {
          map.set(data.child.uuid, []);
        }
        if (!map.has(data.mother.uuid)) {
          map.set(data.mother.uuid, []);
        }
        map.get(data.child.uuid).push(data);
        map.get(data.mother.uuid).push(data);
      }
      return map;
    } else {
      return null;
    }
  }, [childrenData, motherData, isLoadingChildrenData, isLoadingMotherData]);

  return motherChildrenRelationshipsByPatient;
}
