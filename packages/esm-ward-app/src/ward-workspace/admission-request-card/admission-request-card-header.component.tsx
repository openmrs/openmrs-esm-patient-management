import { formatDatetime, getLocale, useAppContext } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import { WardViewContext, type WardPatientCardType } from '../../types';
import styles from './admission-request-card.scss';

const AdmissionRequestCardHeader: WardPatientCardType = (wardPatient) => {
  const { inpatientRequest } = wardPatient;
  const { dispositionEncounter } = inpatientRequest;
  const {WardPatientHeader} = useAppContext<WardViewContext>('ward-view-context') ?? {};

  return (
    <div className={styles.admissionRequestCardHeaderContainer}>
      <div className={styles.admissionRequestCardHeader}>
        {WardPatientHeader && <WardPatientHeader {...wardPatient} />}
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
