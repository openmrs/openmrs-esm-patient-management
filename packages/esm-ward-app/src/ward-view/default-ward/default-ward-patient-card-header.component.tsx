import React from 'react';
import { type WardPatientCardType } from '../../types';
import classNames from 'classnames';
import WardPatientAge from '../../ward-patient-card/row-elements/ward-patient-age.component';
import WardPatientBedNumber from '../../ward-patient-card/row-elements/ward-patient-bed-number.component';
import WardPatientIdentifier from '../../ward-patient-card/row-elements/ward-patient-identifier.component';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name.component';
import WardPatientTimeOnWard from '../../ward-patient-card/row-elements/ward-patient-time-on-ward.component';
import WardPatientTimeSinceAdmission from '../../ward-patient-card/row-elements/ward-patient-time-since-admission.component';
import WardPatientGender from '../../ward-patient-card/row-elements/ward-patient-gender.component';
import styles from '../../ward-patient-card/ward-patient-card.scss';

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
