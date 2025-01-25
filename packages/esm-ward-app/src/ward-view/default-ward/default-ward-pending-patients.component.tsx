import React from 'react';
import { ErrorState, useAppContext } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { type InpatientRequest, type WardViewContext } from '../../types';
import AdmissionRequestCard from '../../ward-workspace/admission-request-card/admission-request-card.component';
import AdmissionRequestNoteRow from '../../ward-patient-card/card-rows/admission-request-note-row.component';
import WardPatientSkeletonText from '../../ward-patient-card/row-elements/ward-patient-skeleton-text.component';

function DefaultWardPendingPatients() {
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
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
      {inpatientRequests?.map((request: InpatientRequest, i) => {
        const wardPatient = {
          patient: request.patient,
          visit: request.visit,
          bed: null,
          inpatientRequest: request,
          inpatientAdmission: null,
        };

        return (
          <AdmissionRequestCard
            key={`admission-request-card-${i}`}
            wardPatient={{
              patient: request.patient,
              visit: request.visit,
              bed: null,
              inpatientRequest: request,
              inpatientAdmission: null,
            }}>
            <AdmissionRequestNoteRow id={'admission-request-note'} wardPatient={wardPatient} />
          </AdmissionRequestCard>
        );
      })}
    </>
  );
}

export default DefaultWardPendingPatients;
