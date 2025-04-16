import React from 'react';
import { useDefineAppContext } from '@openmrs/esm-framework';
import { useWardPatientGrouping } from '../../hooks/useWardPatientGrouping';
import { type MaternalWardViewContext, type WardViewContext } from '../../types';
import { useMotherChildrenRelationshipsByPatient } from './maternal-ward-view.resource';
import MaternalWardBeds from './maternal-ward-beds.component';
import MaternalWardPatientCardHeader from './maternal-ward-patient-card-header.component';
import MaternalWardPendingPatients from './maternal-ward-pending-patients.component';
import MaternalWardUnassignedPatients from './maternal-ward-unassigned-patients.component';
import Ward from '../ward.component';
import WardViewHeader from '../../ward-view-header/ward-view-header.component';

const MaternalWardView = () => {
  const wardPatientGroupDetails = useWardPatientGrouping();
  useDefineAppContext<WardViewContext>('ward-view-context', {
    wardPatientGroupDetails,
    WardPatientHeader: MaternalWardPatientCardHeader,
  });
  const { allWardPatientUuids, isLoading } = wardPatientGroupDetails;

  const motherChildRelationships = useMotherChildrenRelationshipsByPatient(Array.from(allWardPatientUuids), !isLoading);
  useDefineAppContext<MaternalWardViewContext>('maternal-ward-view-context', {
    motherChildRelationships,
  });

  const wardBeds = <MaternalWardBeds {...motherChildRelationships} />;
  const wardUnassignedPatients = <MaternalWardUnassignedPatients />;
  const wardPendingPatients = <MaternalWardPendingPatients />;

  return (
    <>
      <WardViewHeader {...{ wardPendingPatients }} />
      <Ward {...{ wardBeds, wardUnassignedPatients }} />
    </>
  );
};

export default MaternalWardView;
