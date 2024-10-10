import React from 'react';
import { type WardPatientCardType } from '../../types';
import AdmissionRequestNoteRowExtension from '../../ward-patient-card/card-rows/admission-request-note.extension';
import PendingItemsCardRowExtension from '../../ward-patient-card/card-rows/pending-items-card-row.extension';
import WardPatientCard from '../../ward-patient-card/ward-patient-card.component';
import styles from '../../ward-patient-card/ward-patient-card.scss';
import DefaultWardPatientCardHeader from './default-ward-patient-card-header.component';

const DefaultWardPatientCard: WardPatientCardType = (wardPatient) => {
  const { bed } = wardPatient;

  const card = (
    <WardPatientCard wardPatient={wardPatient}>
      <DefaultWardPatientCardHeader {...wardPatient} />
      <PendingItemsCardRowExtension {...wardPatient} />
      <AdmissionRequestNoteRowExtension {...wardPatient} />
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
