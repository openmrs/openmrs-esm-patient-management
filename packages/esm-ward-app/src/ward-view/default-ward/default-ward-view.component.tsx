import React from 'react';
import { useDefineAppContext } from '@openmrs/esm-framework';
import { type WardViewContext } from '../../types';
import { useWardPatientGrouping } from '../../hooks/useWardPatientGrouping';
import DefaultWardBeds from './default-ward-beds.component';
import DefaultWardPatientCardHeader from './default-ward-patient-card-header.component';
import DefaultWardPendingPatients from './default-ward-pending-patients.component';
import DefaultWardUnassignedPatients from './default-ward-unassigned-patients.component';
import Ward from '../ward.component';
import WardViewHeader from '../../ward-view-header/ward-view-header.component';
import WardMetrics from '../../ward-view-header/ward-metrics.component';

const DefaultWardView = () => {
  const wardPatientGroupDetails = useWardPatientGrouping();
  useDefineAppContext<WardViewContext>('ward-view-context', {
    wardPatientGroupDetails,
    WardPatientHeader: DefaultWardPatientCardHeader,
  });

  const wardBeds = <DefaultWardBeds />;
  const wardMetrics = <WardMetrics />;
  const wardUnassignedPatients = <DefaultWardUnassignedPatients />;
  const wardPendingPatients = <DefaultWardPendingPatients />;

  return (
    <>
      <WardViewHeader {...{ wardPendingPatients, wardMetrics }} />
      <Ward {...{ wardBeds, wardUnassignedPatients }} />
    </>
  );
};

export default DefaultWardView;
