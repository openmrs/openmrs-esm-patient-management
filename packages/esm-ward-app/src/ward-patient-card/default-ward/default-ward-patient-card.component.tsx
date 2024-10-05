import classNames from 'classnames';
import React from 'react';
import { type WardPatientCardType } from '../../types';
import PendingItemsCardRowExtension from '../card-rows/pending-items-card-row.extension';
import WardPatientAge from '../row-elements/ward-patient-age';
import WardPatientBedNumber from '../row-elements/ward-patient-bed-number';
import WardPatientIdentifier from '../row-elements/ward-patient-identifier';
import WardPatientName from '../row-elements/ward-patient-name';
import WardPatientTimeOnWard from '../row-elements/ward-patient-time-on-ward';
import WardPatientCard from '../ward-patient-card.component';
import styles from '../ward-patient-card.scss';
import WardPatientTimeSinceAdmission from '../row-elements/ward-patient-time-since-admission';
import AdmissionRequestNoteRowExtension from '../card-rows/admission-request-note.extension';

const DefaultWardPatientCard: WardPatientCardType = (wardPatient) => {
  const { patient, bed, inpatientAdmission } = wardPatient;
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
          <WardPatientTimeOnWard
            encounterAssigningToCurrentInpatientLocation={encounterAssigningToCurrentInpatientLocation}
          />
        </div>
      }
      rows={[<PendingItemsCardRowExtension {...wardPatient} />, <AdmissionRequestNoteRowExtension {...wardPatient} />]}
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

export default DefaultWardPatientCard;
