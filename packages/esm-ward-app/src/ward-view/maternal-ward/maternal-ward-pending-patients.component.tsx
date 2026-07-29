import { ErrorState, useAppContext } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { type InpatientRequest, type WardViewContext } from '../../types';
import AdmissionRequestNoteRow from '../../ward-patient-card/card-rows/admission-request-note-row.component';
import CodedObsTagsRow from '../../ward-patient-card/card-rows/coded-obs-tags-row.component';
import MotherChildRow from '../../ward-patient-card/card-rows/mother-child-row.component';
import WardPatientSkeletonText from '../../ward-patient-card/row-elements/ward-patient-skeleton-text.component';
import MaternalAdmissionRequestCard from '../../ward-workspace/admission-request-card/maternal-admission-request-card.component';

function MaternalWardPendingPatients() {
  const { wardPatientGroupDetails } = useAppContext<WardViewContext>('ward-view-context') ?? {};
  const { t } = useTranslation();
  const { inpatientRequestResponse } = wardPatientGroupDetails ?? {};
  const {
    inpatientRequests,
    isLoading: isLoadingInpatientRequests,
    error: errorFetchingInpatientRequests,
  } = inpatientRequestResponse ?? {};

  const inpatientRequestsOfWardByPatientUuid = inpatientRequests?.reduce(
    (map, inpatientRequest) => {
      const patientUuid = inpatientRequest.patient.uuid;
      map[patientUuid] = inpatientRequest;
      return map;
    },
    {} as Record<string, InpatientRequest>,
  );

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
          <MaternalAdmissionRequestCard
            key={`admission-request-card-${i}`}
            wardPatient={wardPatient}
            inpatientRequestsOfWardByPatientUuid={inpatientRequestsOfWardByPatientUuid}></MaternalAdmissionRequestCard>
        );
      })}
    </>
  );
}

export default MaternalWardPendingPatients;
