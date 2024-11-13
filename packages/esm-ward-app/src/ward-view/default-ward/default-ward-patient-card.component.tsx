import React from 'react';
import { type WardPatientCardType } from '../../types';
import AdmissionRequestNoteRow from '../../ward-patient-card/card-rows/admission-request-note-row.component';
import PendingItemsRow from '../../ward-patient-card/card-rows/pending-items-row.component';
import WardPatientCard from '../../ward-patient-card/ward-patient-card.component';
import styles from '../../ward-patient-card/ward-patient-card.scss';
import DefaultWardPatientCardHeader from './default-ward-patient-card-header.component';

const DefaultWardPatientCard: WardPatientCardType = ({ wardPatient }) => {
  const { bed } = wardPatient;

  const card = (
    <WardPatientCard wardPatient={wardPatient}>
      <DefaultWardPatientCardHeader {...{ wardPatient }} />
      <PendingItemsRow id={'pending-items'} wardPatient={wardPatient} />
      <AdmissionRequestNoteRow id={'admission-request-note'} wardPatient={wardPatient} />
    </WardPatientCard>
  );

  if (bed) {
    return card;
  } else {
    return (
      <div className={styles.unassignedPatient}>
        <div key={'unassigned-bed-pt-' + wardPatient.patient.uuid}>{card}</div>
      </div>
    );
  }
};

export default DefaultWardPatientCard;
