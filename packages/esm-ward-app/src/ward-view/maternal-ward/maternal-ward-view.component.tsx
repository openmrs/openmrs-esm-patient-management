import React from 'react';
import { useDefineAppContext } from '@openmrs/esm-framework';
import { useWardPatientGrouping } from '../../hooks/useWardPatientGrouping';
import { type MaternalWardViewContext, WardMetricType, type WardViewContext } from '../../types';
import { useMotherChildrenRelationshipsByPatient } from './maternal-ward-view.resource';
import MaternalWardBeds from './maternal-ward-beds.component';
import MaternalWardPatientCardHeader from './maternal-ward-patient-card-header.component';
import MaternalWardPendingPatients from './maternal-ward-pending-patients.component';
import MaternalWardUnassignedPatients from './maternal-ward-unassigned-patients.component';
import Ward from '../ward.component';
import WardViewHeader from '../../ward-view-header/ward-view-header.component';
import WardMetrics from '../../ward-view-header/ward-metrics.component';

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
  const wardMetrics = (
    <WardMetrics
      metrics={[
        WardMetricType.PATIENTS,
        WardMetricType.FEMALES_OF_REPRODUCTIVE_AGE,
        WardMetricType.NEWBORNS,
        WardMetricType.FREE_BEDS,
        WardMetricType.TOTAL_BEDS,
        WardMetricType.PENDING_OUT,
      ]}
    />
  );
  const wardUnassignedPatients = <MaternalWardUnassignedPatients />;
  const wardPendingPatients = <MaternalWardPendingPatients />;

  return (
    <>
      <WardViewHeader {...{ wardPendingPatients, wardMetrics }} />
      <Ward {...{ wardBeds, wardUnassignedPatients }} />
    </>
  );
};

export default MaternalWardView;
