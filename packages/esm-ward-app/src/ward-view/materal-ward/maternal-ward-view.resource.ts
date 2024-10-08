import { useMemo } from "react";
import { MothersAndChildrenSearchCriteria, useMotherAndChildren } from "../../hooks/useMotherAndChildren";
import { MotherAndChild } from "../../types";

const motherAndChildrenRep =
  'custom:(childAdmission,mother:(person,identifiers:full,uuid),child:(person,identifiers:full,uuid),motherAdmission)';


export function useMotherChildrenRelationshipsByPatient(allWardPatientUuids: string[]) {
  
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
  } = useMotherAndChildren(getChildrenRequestParams, allWardPatientUuids != null, motherAndChildrenRep);
  const {
    data: motherData,
    isLoading: isLoadingMotherData,
    error: motherDataError,
  } = useMotherAndChildren(getMotherRequestParams, allWardPatientUuids != null, motherAndChildrenRep);

  const motherChildrenRelationshipsByPatient = useMemo(() => {
    if(!isLoadingChildrenData && !isLoadingMotherData) {
      const map = new Map<string, MotherAndChild[]>();
      for(const data of [...childrenData, ...motherData]) {
        if(!map.has(data.child.uuid)) {
          map.set(data.child.uuid, []);
        }
        if(!map.has(data.mother.uuid)) {
          map.set(data.mother.uuid, []);
        }
        map.get(data.child.uuid).push(data);
        map.get(data.mother.uuid).push(data);
      }
      return map;
    } else {
      return null;
    }
  }, []);

  return motherChildrenRelationshipsByPatient;
}