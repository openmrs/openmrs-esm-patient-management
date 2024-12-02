import classNames from 'classnames';
import React from 'react';
import WardPatientAge from '../../ward-patient-card/row-elements/ward-patient-age';
import WardPatientBedNumber from '../../ward-patient-card/row-elements/ward-patient-bed-number';
import WardPatientIdentifier from '../../ward-patient-card/row-elements/ward-patient-identifier';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name';
import WardPatientTimeOnWard from '../../ward-patient-card/row-elements/ward-patient-time-on-ward';
import WardPatientTimeSinceAdmission from '../../ward-patient-card/row-elements/ward-patient-time-since-admission';
import styles from '../../ward-patient-card/ward-patient-card.scss';
import { type WardPatientCardType } from '../../types';
import WardPatientGender from '../../ward-patient-card/row-elements/ward-patient-gender.component';

const DefaultWardPatientCardHeader: WardPatientCardType = ({ wardPatient }) => {
  const { patient, bed, inpatientAdmission } = wardPatient;
  const { encounterAssigningToCurrentInpatientLocation, firstAdmissionOrTransferEncounter } = inpatientAdmission ?? {};

  return (
    <div className={classNames(styles.wardPatientCardRow, styles.wardPatientCardHeader)}>
      {bed ? <WardPatientBedNumber bed={bed} /> : null}
      <WardPatientName patient={patient} />
      <WardPatientIdentifier id="patient-identifier" patient={patient} />
      <WardPatientGender patient={patient} />
      <WardPatientAge patient={patient} />
      <WardPatientTimeSinceAdmission firstAdmissionOrTransferEncounter={firstAdmissionOrTransferEncounter} />
      <WardPatientTimeOnWard
        encounterAssigningToCurrentInpatientLocation={encounterAssigningToCurrentInpatientLocation}
      />
    </div>
  );
};

export default DefaultWardPatientCardHeader;
