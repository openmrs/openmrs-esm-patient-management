import classNames from 'classnames';
import React from 'react';
import { type WardPatientCardType } from '../../types';
import WardPatientAge from '../../ward-patient-card/row-elements/ward-patient-age';
import WardPatientBedNumber from '../../ward-patient-card/row-elements/ward-patient-bed-number';
import WardPatientAddress from '../../ward-patient-card/row-elements/ward-patient-header-address';
import WardPatientIdentifier from '../../ward-patient-card/row-elements/ward-patient-identifier';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name';
import WardPatientObs from '../../ward-patient-card/row-elements/ward-patient-obs';
import WardPatientTimeSinceAdmission from '../../ward-patient-card/row-elements/ward-patient-time-since-admission';
import styles from '../../ward-patient-card/ward-patient-card.scss';

const MaternalWardPatientCardHeader: WardPatientCardType = ({ wardPatient }) => {
  const { patient, bed, visit, inpatientAdmission } = wardPatient;
  const { firstAdmissionOrTransferEncounter } = inpatientAdmission ?? {};

  return (
    <div className={classNames(styles.wardPatientCardRow, styles.wardPatientCardHeader)}>
      {bed ? <WardPatientBedNumber bed={bed} /> : null}
      <WardPatientName patient={patient} />
      <WardPatientIdentifier id="patient-identifier" patient={patient} />
      <WardPatientAge patient={patient} />
      <WardPatientAddress id={'patient-address'} patient={patient} />
      <WardPatientObs id={'admission-reason'} patient={patient} visit={visit} />
      <WardPatientTimeSinceAdmission firstAdmissionOrTransferEncounter={firstAdmissionOrTransferEncounter} />
    </div>
  );
};

export default MaternalWardPatientCardHeader;
