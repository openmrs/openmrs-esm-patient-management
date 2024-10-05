import React from 'react';
import DefaultWardBeds from './default-ward-beds.component';
import DefaultWardUnassignedPatients from './default-ward-unassigned-patients.component';
import { useDefineAppContext } from '@openmrs/esm-framework';
import { useWardPatientGrouping } from '../../hooks/useWardPatientGrouping';
import { type WardPatientGroupDetails } from '../../types';
import WardView from '../ward-view.component';
import DefaultWardPendingPatients from './default-ward-pending-patients.component';

const DefaultWardView = () => {
  const wardPatientsGroupDetails = useWardPatientGrouping();
  useDefineAppContext<WardPatientGroupDetails>('ward-patients-group', wardPatientsGroupDetails);

  const wardBeds = <DefaultWardBeds />;
  const wardUnassignedPatients = <DefaultWardUnassignedPatients />;
  const wardPendingPatients = <DefaultWardPendingPatients />;

  return <WardView {...{ wardBeds, wardUnassignedPatients, wardPendingPatients }} />;
};

export default DefaultWardView;
