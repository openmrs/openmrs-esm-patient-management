import { Patient, useAppContext, useConfig, useDefineAppContext } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { MotherChildRowExtensionDefinition } from '../../config-schema';
import { MothersAndChildrenSearchCriteria, useMotherAndChildren } from '../../hooks/useMotherAndChildren';
import useWardLocation from '../../hooks/useWardLocation';
import { MotherAndChildrenRelationships, WardPatientGroupDetails } from '../../types';

const MotherChildRowParentExtension: React.FC<{}> = () => {
  const { maternalLocations, childLocations } = useConfig<MotherChildRowExtensionDefinition>();
  const {location} = useWardLocation();
  const {allWardPatientUuids, inpatientAdmissionResponse, admissionLocationResponse, inpatientRequestResponse} = useAppContext<WardPatientGroupDetails>('ward-patients-group') ?? {};
  const allWardPatientUuidsArray = Array.from(allWardPatientUuids ?? []);
  
  const params : MothersAndChildrenSearchCriteria = {
    mothers: maternalLocations.includes(location.uuid) ? allWardPatientUuidsArray: null,
    children: childLocations.includes(location.uuid) ? allWardPatientUuidsArray: null,
    requireMotherHasActiveVisit: true,
    requireChildHasActiveVisit: true,
    requireChildBornDuringMothersActiveVisit: true,
  };
  
  const fetchMotherAndChildren: boolean = !inpatientAdmissionResponse?.isLoading && !admissionLocationResponse?.isLoading && !inpatientRequestResponse?.isLoading;
  const motherAndChildren = useMotherAndChildren(params, fetchMotherAndChildren);
  const motherAndChildrenRelationships = useMemo(() => {
    const motherByChildUuid = new Map<string, Patient>();
    const childrenByMotherUuid = new Map<string, Array<Patient>>();

    if(motherAndChildren.data && !motherAndChildren.isLoading) {
      for(const {mother, child} of motherAndChildren.data) {
        motherByChildUuid.set(child.uuid, mother);
        if(!childrenByMotherUuid.has(mother.uuid)) {
          childrenByMotherUuid.set(mother.uuid, []);
        }
        childrenByMotherUuid.get(mother.uuid).push(child);
      }
    }

    return {motherByChildUuid, childrenByMotherUuid};
  }, [motherAndChildren]);

  useDefineAppContext<MotherAndChildrenRelationships>('mother-child-row', motherAndChildrenRelationships);

  return <>blahblah</>;
};

export default MotherChildRowParentExtension;
