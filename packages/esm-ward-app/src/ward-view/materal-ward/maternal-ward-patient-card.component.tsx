import classNames from 'classnames';
import React from 'react';
import { type WardPatientCardType } from '../../types';
import AdmissionRequestNoteRowExtension from '../../ward-patient-card/card-rows/admission-request-note.extension';
import MotherChildRowExtension from '../../ward-patient-card/card-rows/mother-child-row.extension';
import PendingItemsCardRowExtension from '../../ward-patient-card/card-rows/pending-items-card-row.extension';
import WardPatientAge from '../../ward-patient-card/row-elements/ward-patient-age';
import WardPatientBedNumber from '../../ward-patient-card/row-elements/ward-patient-bed-number';
import WardPatientIdentifier from '../../ward-patient-card/row-elements/ward-patient-identifier';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name';
import WardPatientTimeOnWard from '../../ward-patient-card/row-elements/ward-patient-time-on-ward';
import WardPatientTimeSinceAdmission from '../../ward-patient-card/row-elements/ward-patient-time-since-admission';
import WardPatientCard from '../../ward-patient-card/ward-patient-card.component';
import styles from '../../ward-patient-card/ward-patient-card.scss';
import WardPatientObs from '../../ward-patient-card/row-elements/ward-patient-obs';

const MaternalWardPatientCard: WardPatientCardType = (wardPatient) => {
  const { patient, visit, bed, inpatientAdmission } = wardPatient;
  const { encounterAssigningToCurrentInpatientLocation, firstAdmissionOrTransferEncounter } = inpatientAdmission ?? {};

  const card = (
    <WardPatientCard
      header={
        <div className={classNames(styles.wardPatientCardRow, styles.wardPatientCardHeader)}>
          {bed ? <WardPatientBedNumber bed={bed} /> : null}
          <WardPatientName patient={patient} />
          <WardPatientIdentifier patient={patient} />
          <WardPatientAge patient={patient} />
          <WardPatientTimeSinceAdmission firstAdmissionOrTransferEncounter={firstAdmissionOrTransferEncounter} />
        </div>
      }
      rows={[
        <div className={styles.wardPatientCardRow}>
          <WardPatientTimeOnWard
            encounterAssigningToCurrentInpatientLocation={encounterAssigningToCurrentInpatientLocation}
          />
          <WardPatientObs id={"gravida"} patient={patient} visit={visit} />
        </div>,
        <PendingItemsCardRowExtension {...wardPatient} />, 
        // <ColoredObsTagsCardRowExtension {...wardPatient} />,
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
