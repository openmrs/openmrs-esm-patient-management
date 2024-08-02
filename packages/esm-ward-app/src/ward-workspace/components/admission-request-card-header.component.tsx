import React from 'react';
import type { InpatientRequest } from '../../types';
import WardPatientAge from '../../ward-patient-card/row-elements/ward-patient-age';
import WardPatientGender from '../../ward-patient-card/row-elements/ward-patient-gender.component';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name';
import styles from './admission-request-card.scss';
import classNames from 'classnames';
import { formatDatetime, getLocale } from '@openmrs/esm-framework';

interface AdmissionRequestCardHeaderProps {
  patient: InpatientRequest['patient'];
  dispositionEncounter: InpatientRequest['dispositionEncounter'];
}

const AdmissionRequestCardHeader: React.FC<AdmissionRequestCardHeaderProps> = ({ patient, dispositionEncounter }) => {
  return (
    <div className={styles.admissionRequestCardHeaderContainer}>
      <div className={styles.admissionRequestCardHeader}>
        <WardPatientName patient={patient} />
        <WardPatientGender patient={patient} />
        <WardPatientAge patient={patient} />
      </div>
      <div className={classNames(styles.admissionRequestCardHeader, styles.admissionEncounterDetails)}>
        <div>
          {formatDatetime(new Date(dispositionEncounter?.encounterDatetime), {
            locale: getLocale(),
            mode: 'standard',
          })}
        </div>
        <div>{dispositionEncounter?.encounterProviders?.map((provider) => provider?.provider?.display).join(',')}</div>
        <div>{dispositionEncounter?.location?.display}</div>
      </div>
    </div>
  );
};

export default AdmissionRequestCardHeader;
