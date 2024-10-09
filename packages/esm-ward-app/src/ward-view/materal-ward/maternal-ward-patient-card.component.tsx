import classNames from 'classnames';
import React from 'react';
import { type WardPatientCardType } from '../../types';
import AdmissionRequestNoteRowExtension from '../../ward-patient-card/card-rows/admission-request-note.extension';
import MotherChildRowExtension from '../../ward-patient-card/card-rows/mother-child-row.extension';
import PendingItemsCardRowExtension from '../../ward-patient-card/card-rows/pending-items-card-row.extension';
import WardPatientObs from '../../ward-patient-card/row-elements/ward-patient-obs';
import WardPatientTimeOnWard from '../../ward-patient-card/row-elements/ward-patient-time-on-ward';
import WardPatientCard from '../../ward-patient-card/ward-patient-card.component';
import styles from '../../ward-patient-card/ward-patient-card.scss';
import MaternalWardPatientCardHeader from './maternal-ward-patient-card-header.component';
import WardPatientCodedObsTags from '../../ward-patient-card/row-elements/ward-patient-coded-obs-tags';

const MaternalWardPatientCard: WardPatientCardType = (wardPatient) => {
  const { patient, visit, bed, inpatientAdmission } = wardPatient;
  const { encounterAssigningToCurrentInpatientLocation, firstAdmissionOrTransferEncounter } = inpatientAdmission ?? {};

  const card = (
    <WardPatientCard
      header={<MaternalWardPatientCardHeader {...wardPatient} />}
      rows={[
        <div className={classNames(styles.wardPatientCardRow, styles.dotSeparatedChildren)}>
          <WardPatientTimeOnWard
            encounterAssigningToCurrentInpatientLocation={encounterAssigningToCurrentInpatientLocation}
          />
          <WardPatientObs id={"gravida"} patient={patient} visit={visit} />
        </div>,
        <PendingItemsCardRowExtension {...wardPatient} />, 
        <WardPatientCodedObsTags id="pregnancy-complications" {...wardPatient} />,
        <MotherChildRowExtension {...wardPatient} />,
        <AdmissionRequestNoteRowExtension {...wardPatient} />
      ]}
      wardPatient={wardPatient}
    />
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
