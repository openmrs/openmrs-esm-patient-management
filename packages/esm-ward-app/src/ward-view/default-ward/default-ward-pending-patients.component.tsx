import { ErrorState, useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { WardViewContext, type InpatientRequest } from '../../types';
import AdmissionRequestCard from '../../ward-workspace/admission-request-card/admission-request-card.component';
import WardPatientSkeletonText from '../../ward-patient-card/row-elements/ward-pateint-skeleton-text';

function DefaultWardPendingPatients() {
  const {wardPatientGroupDetails} = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { t } = useTranslation();
  const { inpatientRequestResponse } = wardPatientGroupDetails ?? {};
  const {
    inpatientRequests,
    isLoading: isLoadingInpatientRequests,
    error: errorFetchingInpatientRequests,
  } = inpatientRequestResponse ?? {};

  return isLoadingInpatientRequests ? (
    <WardPatientSkeletonText />
  ) : errorFetchingInpatientRequests ? (
    <ErrorState headerTitle={t('admissionRequests', 'Admission requests')} error={errorFetchingInpatientRequests} />
  ) : (
    <>
      {inpatientRequests?.map((request: InpatientRequest, i) => (
        <AdmissionRequestCard
          key={`admission-request-card-${i}`}
          patient={request.patient}
          visit={request.visit}
          bed={null}
          inpatientRequest={request}
          inpatientAdmission={null}
        />
      ))}
    </>
  );
}

export default DefaultWardPendingPatients;
