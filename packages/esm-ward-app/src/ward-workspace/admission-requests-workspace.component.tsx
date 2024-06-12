import React from 'react';
import styles from './admission-requests-workspace.scss';
import AdmissionRequestCard from './admission-request-card.component';
import { useParams } from 'react-router-dom';
import { useDisposition } from '../hooks/useDisposition';
import EmptyBedSkeleton from '../beds/empty-bed-skeleton';
import { mockPatientAlice } from '../../../../__mocks__/patient.mock';
import { useTranslation } from 'react-i18next';
import { closeWorkspace, showNotification } from '@openmrs/esm-framework';

// const testPatient = mockPatientAlice;
// testPatient.person.preferredName = {
//   givenName: 'Chi bong',
//   familyName: 'ho',
//   uuid: '',
// };
const AdmissionRequestsWorkspace = () => {
  const { locationUuid } = useParams();
  const { t } = useTranslation();
  const { admissionRequests, isLoading, error } = useDisposition(locationUuid);
  // const testDispositionData = [
  //   {
  //     patient: testPatient,
  //   },
  // ];
  if (isLoading) {
    return (
      <div className={styles.admissionRequestsWorkspace}>
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <EmptyBedSkeleton key={i} />
          ))}
      </div>
    );
  }

  if (error) {
    closeWorkspace('admission-requests-cards');
    showNotification({
      kind: 'error',
      title: t('errorLoadingPatientAdmissionRequests', 'Error Loading Patient Admission Requests'),
      description: error.message,
    });
  }
  return (
    <div className={styles.admissionRequestsWorkspace}>
      {admissionRequests?.map((disposition) => <AdmissionRequestCard patient={disposition.patient} />)}
    </div>
  );
};

export default AdmissionRequestsWorkspace;
