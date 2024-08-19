import { ExtensionSlot, formatDatetime, getLocale } from '@openmrs/esm-framework';
import classNames from 'classnames';
import React from 'react';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import styles from './admission-request-card.scss';
import type WardPatientCard from '../../ward-patient-card/ward-patient-card.component';
import { useCurrentWardCardConfig } from '../../hooks/useCurrentWardCardConfig';
import { WardPatientCardElement } from '../../ward-patient-card/ward-patient-card-element.component';
import WardPatientName from '../../ward-patient-card/row-elements/ward-patient-name';

const AdmissionRequestCardHeader: WardPatientCard = (wardPatient) => {
  const { inpatientRequest } = wardPatient;
  const { dispositionEncounter } = inpatientRequest;
  const { id, headerRowElements } = useCurrentWardCardConfig();
  const { patient } = wardPatient;
  const extensionSlotState = wardPatient;

  const rowsExtensionSlotName = id == 'default' ? 'ward-patient-card-slot' : `ward-patient-card-${id}-slot`;

  return (
    <div className={styles.admissionRequestCardHeaderContainer}>
      <div className={styles.admissionRequestCardHeader}>
        <WardPatientName patient={patient} />
        {headerRowElements.map((elementId, i) => (
          <WardPatientCardElement
            key={`ward-card-${patient.uuid}-header-${i}`}
            elementId={elementId}
            {...wardPatient}
          />
        ))}
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
        className={styles.admissionRequestCardRow}
      />
    </div>
  );
};

export default AdmissionRequestCardHeader;
