import { useConfig, useDefineAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { WardConfigObject } from '../../config-schema';
import { useWardPatientGrouping } from '../../hooks/useWardPatientGrouping';
import { WardViewContext } from '../../types';
import WardView from '../ward-view.component';
import MaternalWardBeds from './maternal-ward-beds.component';
import MaternalWardUnassignedPatients from './maternal-ward-unassigned-patients.component';
import { useMotherChildrenRelationshipsByPatient } from './maternal-ward-view.resource';

const MaternalWardView = () => {
  const wardPatientGroupDetails = useWardPatientGrouping();
  useDefineAppContext<WardViewContext>('ward-view-context', {
    wardPatientGroupDetails,
    elementConfigById: null
  });

  const allWardPatientUuids = wardPatientGroupDetails.allWardPatientUuids ? Array.from(wardPatientGroupDetails.allWardPatientUuids) : null;
  const motherChildrenRelationshipsByPatient = useMotherChildrenRelationshipsByPatient(allWardPatientUuids);


  const wardBeds = <MaternalWardBeds {...{motherChildrenRelationshipsByPatient}} />;
  const wardUnassignedPatients = <MaternalWardUnassignedPatients />;
  const wardPendingPatients = null; // <DefaultWardPendingPatients />;

  return <WardView {...{ wardBeds, wardUnassignedPatients, wardPendingPatients }} />;
};

export default MaternalWardView;
