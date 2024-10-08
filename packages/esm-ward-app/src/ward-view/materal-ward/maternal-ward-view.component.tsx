import { useConfig, useDefineAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { useWardPatientGrouping } from '../../hooks/useWardPatientGrouping';
import { type WardPatientGroupDetails } from '../../types';
import WardView from '../ward-view.component';
import MaternalWardBeds from './maternal-ward-beds.component';
import MaternalWardUnassignedPatients from './maternal-ward-unassigned-patients.component';
import { useMotherChildrenRelationshipsByPatient } from './maternal-ward-view.resource';
import { WardConfigObject } from '../../config-schema';
import useSWR from 'swr';

const MaternalWardView = () => {
  const wardPatientsGroupDetails = useWardPatientGrouping();
  useDefineAppContext<WardPatientGroupDetails>('ward-patients-group', wardPatientsGroupDetails);

  const allWardPatientUuids = wardPatientsGroupDetails.allWardPatientUuids ? Array.from(wardPatientsGroupDetails.allWardPatientUuids) : null;
  const motherChildrenRelationshipsByPatient = useMotherChildrenRelationshipsByPatient(allWardPatientUuids);


  const wardBeds = <MaternalWardBeds {...{motherChildrenRelationshipsByPatient}} />;
  const wardUnassignedPatients = <MaternalWardUnassignedPatients />;
  const wardPendingPatients = null; // <DefaultWardPendingPatients />;

  return <WardView {...{ wardBeds, wardUnassignedPatients, wardPendingPatients }} />;
};

function useObsElementConfigMap() {
  const {wardPatientCards} = useConfig<WardConfigObject>();
  return getElementConfigMap("obsElementDefinitions");
}

function getElementConfigMap(defn: string) {
  const {wardPatientCards} = useConfig<WardConfigObject>();
  const array: Array<any> = wardPatientCards?.[defn];
  const elementConfigById = new Map<string, any>();
  for(const elementConfig of array) {
    elementConfigById.set(elementConfig.id, elementConfig);
  }
  return elementConfigById;
}

export default MaternalWardView;
