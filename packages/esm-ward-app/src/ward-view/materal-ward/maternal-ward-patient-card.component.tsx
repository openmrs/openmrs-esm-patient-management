import classNames from 'classnames';
import React from 'react';
import { type WardPatientCardType } from '../../types';
import AdmissionRequestNoteRow from '../../ward-patient-card/card-rows/admission-request-note-row.component';
import CodedObsTagsRow from '../../ward-patient-card/card-rows/coded-obs-tags-row.component';
import MotherChildRowExtension from '../../ward-patient-card/card-rows/mother-child-row.component';
import PendingItemsRow from '../../ward-patient-card/card-rows/pending-items-row.component';
import WardPatientObs from '../../ward-patient-card/row-elements/ward-patient-obs';
import WardPatientTimeOnWard from '../../ward-patient-card/row-elements/ward-patient-time-on-ward';
import WardPatientCard from '../../ward-patient-card/ward-patient-card.component';
import styles from '../../ward-patient-card/ward-patient-card.scss';
import MaternalWardPatientCardHeader from './maternal-ward-patient-card-header.component';

const MaternalWardPatientCard: WardPatientCardType = (wardPatient) => {
  const { patient, visit, bed, inpatientAdmission } = wardPatient;
  const { encounterAssigningToCurrentInpatientLocation } = inpatientAdmission ?? {};

  const card = (
    <WardPatientCard wardPatient={wardPatient}>
      <MaternalWardPatientCardHeader {...wardPatient} />
      <div className={classNames(styles.wardPatientCardRow, styles.dotSeparatedChildren)}>
        <WardPatientTimeOnWard
          encounterAssigningToCurrentInpatientLocation={encounterAssigningToCurrentInpatientLocation}
        />
        <WardPatientObs id={'gravida'} patient={patient} visit={visit} />
      </div>
      <PendingItemsRow id={'pending-items'} wardPatient={wardPatient} />
      <CodedObsTagsRow id="pregnancy-complications" {...wardPatient} />
      <MotherChildRowExtension {...wardPatient} />
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

export default MaternalWardPatientCard;
