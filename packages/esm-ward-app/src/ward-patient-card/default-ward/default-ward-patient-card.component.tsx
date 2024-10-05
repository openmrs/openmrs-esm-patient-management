import classNames from 'classnames';
import React from 'react';
import { type WardPatientCardType } from '../../types';
import WardPatientAge from '../row-elements/ward-patient-age';
import WardPatientBedNumber from '../row-elements/ward-patient-bed-number';
import WardPatientIdentifier from '../row-elements/ward-patient-identifier';
import WardPatientName from '../row-elements/ward-patient-name';
import WardPatientCard from '../ward-patient-card.component';
import styles from '../ward-patient-card.scss';
import PendingItemsCardRowExtension from '../card-rows/pending-items-card-row.extension';

const DefaultWardPatientCard: WardPatientCardType = (wardPatient) => {
  const { patient, bed } = wardPatient;

  const card = (
    <WardPatientCard
      header={
        <div className={classNames(styles.wardPatientCardRow, styles.wardPatientCardHeader)}>
          {bed ? <WardPatientBedNumber bed={bed} /> : null}
          <WardPatientName patient={patient} />
          <WardPatientIdentifier patient={patient} />
          <WardPatientAge patient={patient} />
        </div>
      }
      rows={[<PendingItemsCardRowExtension {...wardPatient} />]}
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
