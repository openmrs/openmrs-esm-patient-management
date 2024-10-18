import { ErrorState, useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type InpatientRequest, type WardViewContext } from '../../types';
import AdmissionRequestNoteRow from '../../ward-patient-card/card-rows/admission-request-note-row.component';
import CodedObsTagsRow from '../../ward-patient-card/card-rows/coded-obs-tags-row.component';
import MotherChildRow from '../../ward-patient-card/card-rows/mother-child-row.component';
import WardPatientSkeletonText from '../../ward-patient-card/row-elements/ward-patient-skeleton-text';
import AdmissionRequestCard from '../../ward-workspace/admission-request-card/admission-request-card.component';

function MaternalWardPendingPatients() {
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
          <AdmissionRequestCard key={`admission-request-card-${i}`} wardPatient={wardPatient}>
            <CodedObsTagsRow id="pregnancy-complications" {...wardPatient} />
            <MotherChildRow wardPatient={wardPatient} childrenOfWardPatientInSameBed={[]} />
            <AdmissionRequestNoteRow id={'admission-request-note'} wardPatient={wardPatient} />
          </AdmissionRequestCard>
        );
      })}
    </>
  );
}

export default MaternalWardPendingPatients;
