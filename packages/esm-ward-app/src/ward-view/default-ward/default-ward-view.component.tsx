import { useDefineAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { useWardPatientGrouping } from '../../hooks/useWardPatientGrouping';
import { type WardViewContext } from '../../types';
import WardViewHeader from '../../ward-view-header/ward-view-header.component';
import Ward from '../ward.component';
import DefaultWardBeds from './default-ward-beds.component';
import DefaultWardPendingPatients from './default-ward-pending-patients.component';
import DefaultWardUnassignedPatients from './default-ward-unassigned-patients.component';
import DefaultWardPatientCardHeader from './default-ward-patient-card-header.component';

const DefaultWardView = () => {
  const wardPatientGroupDetails = useWardPatientGrouping();
  useDefineAppContext<WardViewContext>('ward-view-context', {
    wardPatientGroupDetails,
    WardPatientHeader: DefaultWardPatientCardHeader
  });

  const wardBeds = <DefaultWardBeds />;
  const wardUnassignedPatients = <DefaultWardUnassignedPatients />;
  const wardPendingPatients = <DefaultWardPendingPatients />;

  return (
    <>
      <WardViewHeader {...{ wardPendingPatients }} />
      <Ward {...{ wardBeds, wardUnassignedPatients }} />
    </>
  );
};

export default DefaultWardView;
