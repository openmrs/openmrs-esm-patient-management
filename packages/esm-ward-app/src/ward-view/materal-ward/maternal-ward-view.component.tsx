import { useDefineAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { useWardPatientGrouping } from '../../hooks/useWardPatientGrouping';
import { WardViewContext } from '../../types';
import WardViewHeader from '../../ward-view-header/ward-view-header.component';
import Ward from '../ward.component';
import MaternalWardBeds from './maternal-ward-beds.component';
import MaternalWardPatientCardHeader from './maternal-ward-patient-card-header.component';
import MaternalWardUnassignedPatients from './maternal-ward-unassigned-patients.component';
import { useMotherChildrenRelationshipsByPatient } from './maternal-ward-view.resource';
import DefaultWardPendingPatients from '../default-ward/default-ward-pending-patients.component';

const MaternalWardView = () => {
  const wardPatientGroupDetails = useWardPatientGrouping();
  useDefineAppContext<WardViewContext>('ward-view-context', {
    wardPatientGroupDetails,
    WardPatientHeader: MaternalWardPatientCardHeader
  });

  const allWardPatientUuids = wardPatientGroupDetails.allWardPatientUuids ? Array.from(wardPatientGroupDetails.allWardPatientUuids) : null;
  const motherChildrenRelationshipsByPatient = useMotherChildrenRelationshipsByPatient(allWardPatientUuids);


  const wardBeds = <MaternalWardBeds {...{motherChildrenRelationshipsByPatient}} />;
  const wardUnassignedPatients = <MaternalWardUnassignedPatients />;
  const wardPendingPatients = <DefaultWardPendingPatients />;
  
  return (
    <>
      <WardViewHeader {...{ wardPendingPatients }} />
      <Ward {...{ wardBeds, wardUnassignedPatients }} />
    </>
  );
};

export default MaternalWardView;
