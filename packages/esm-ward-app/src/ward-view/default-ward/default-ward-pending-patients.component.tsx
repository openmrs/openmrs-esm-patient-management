import { ErrorState, useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type InpatientRequest, type WardPatientGroupDetails } from '../../types';
import AdmissionRequestCard from '../../ward-workspace/admission-request-card/admission-request-card.component';

function DefaultWardPendingPatients() {
  const wardPatientsGrouping = useAppContext<WardPatientGroupDetails>('ward-patients-group');
  const { t } = useTranslation();
  const { inpatientRequestResponse } = wardPatientsGrouping ?? {};
  const {
    inpatientRequests,
    isLoading: isLoadingInpatientRequests,
    error: errorFetchingInpatientRequests,
  } = inpatientRequestResponse ?? {};

  return isLoadingInpatientRequests ? (
    <>Loading</>
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
