import React from 'react';
import classNames from 'classnames';
import { type WardPatientCardType } from '../../types';
import WardPatientAge from '../../ward-patient-card/row-elements/ward-patient-age.component';
import WardPatientBedNumber from '../../ward-patient-card/row-elements/ward-patient-bed-number.component';
import WardPatientAddress from '../../ward-patient-card/row-elements/ward-patient-header-address.component';
import WardPatientIdentifier from '../../ward-patient-card/row-elements/ward-patient-identifier.component';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name.component';
import WardPatientObs from '../../ward-patient-card/row-elements/ward-patient-obs.component';
import WardPatientTimeSinceAdmission from '../../ward-patient-card/row-elements/ward-patient-time-since-admission.component';
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
