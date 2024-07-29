import React, { useMemo } from 'react';
import { ExtensionSlot, type Visit, type Patient } from '@openmrs/esm-framework';
import { useCurrentWardCardConfig, WardPatientCardElement } from '../ward-patient-card/ward-patient-card-row.resources';
import classNames from 'classnames';
import WardPatientName from '../ward-patient-card/row-elements/ward-patient-name';
import styles from './admission-request-card.scss';
import { type Encounter } from '../types';

interface AdmissionRequestCardProps {
  patient: Patient;
  visit: Visit;
  firstAdmissionOrTransferEncounter: Encounter;
  encounterAssigningToCurrentInpatientLocation: Encounter;
}

const AdmissionRequestCard: React.FC<AdmissionRequestCardProps> = ({
  patient,
  visit,
  firstAdmissionOrTransferEncounter,
  encounterAssigningToCurrentInpatientLocation,
}) => {
  const { id, headerRowElements } = useCurrentWardCardConfig();

  const extensionSlotName = id == 'default' ? 'ward-patient-card' : `ward-patient-card-${id}`;

  const extensionSlotState = useMemo(() => {
    return {
      patient,
      visit,
      bed: null,
    };
  }, [patient, visit]);

  return (
    <div className={styles.admissionRequestCard}>
      <div className={classNames(styles.wardPatientCardRow, styles.wardPatientCardHeader)}>
        <WardPatientName patient={patient} />
        {headerRowElements.map((elementId, i) => (
          <WardPatientCardElement
            key={`ward-card-${patient.uuid}-header-${i}`}
            elementId={elementId}
            patient={patient}
            visit={visit}
            firstAdmissionOrTransferEncounter={firstAdmissionOrTransferEncounter}
            encounterAssigningToCurrentInpatientLocation={encounterAssigningToCurrentInpatientLocation}
          />
        ))}
      </div>
      <ExtensionSlot
        name={extensionSlotName}
        state={extensionSlotState}
        className={classNames(styles.wardPatientCardRow, styles.wardPatientCardExtensionSlot)}
      />
    </div>
  );
};

export default AdmissionRequestCard;
