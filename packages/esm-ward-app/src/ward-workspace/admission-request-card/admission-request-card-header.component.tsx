import { ExtensionSlot, formatDatetime, getLocale } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import { useCurrentWardCardConfig } from '../../hooks/useCurrentWardCardConfig';
import { type WardPatientCardType } from '../../types';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name';
import styles from './admission-request-card.scss';

const AdmissionRequestCardHeader: WardPatientCardType = (wardPatient) => {
  const { inpatientRequest } = wardPatient;
  const { dispositionEncounter } = inpatientRequest;
  const { id } = useCurrentWardCardConfig();
  const { patient } = wardPatient;
  const extensionSlotState = wardPatient;

  const rowsExtensionSlotName = id == 'default' ? 'ward-patient-card-slot' : `ward-patient-card-${id}-slot`;

  return (
    <div className={styles.admissionRequestCardHeaderContainer}>
      <div className={styles.admissionRequestCardHeader}>
        <WardPatientName patient={patient} />
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
      <ExtensionSlot
        name={rowsExtensionSlotName}
        state={extensionSlotState}
        className={styles.admissionRequestCardExtensionSlot}
      />
    </div>
  );
};

export default AdmissionRequestCardHeader;
