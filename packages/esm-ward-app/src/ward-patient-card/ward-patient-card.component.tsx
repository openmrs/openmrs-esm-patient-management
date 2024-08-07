import React, { useMemo } from 'react';
import { type WardPatientCard } from '../types';
import { WardPatientCardElement } from './ward-patient-card-element.component';
import { useCurrentWardCardConfig } from '../hooks/useCurrentWardCardConfig';
import styles from './ward-patient-card.scss';
import { ExtensionSlot, getPatientName, launchWorkspace, type Patient, type Visit } from '@openmrs/esm-framework';
import WardPatientName from './row-elements/ward-patient-name';
import WardPatientBedNumber from './row-elements/ward-patient-bed-number';
import classNames from 'classnames';
import { type WardPatientWorkspaceProps } from '../ward-patient-workspace/types';

const WardPatientCard: WardPatientCard = ({
  patient,
  visit,
  bed,
  admitted,
  inpatientAdmission,
}) => {
  const { id, headerRowElements, footerRowElements } = useCurrentWardCardConfig();

  const headerExtensionSlotName =
    id == 'default' ? 'ward-patient-card-header-slot' : `ward-patient-card-header-${id}-slot`;
  const rowsExtensionSlotName = id == 'default' ? 'ward-patient-card-slot' : `ward-patient-card-${id}-slot`;
  const footerExtensionSlotName =
    id == 'default' ? 'ward-patient-card-footer-slot' : `ward-patient-card-footer-${id}-slot`;

  const extensionSlotState = useMemo(() => {
    return {
      patient,
      visit,
      bed,
    };
  }, [patient, visit, bed]);

  return (
    <div className={styles.wardPatientCard}>
      <div className={classNames(styles.wardPatientCardRow, styles.wardPatientCardHeader)}>
        {bed ? <WardPatientBedNumber bed={bed} /> : null}
        <WardPatientName patient={patient} />
        {headerRowElements.map((elementId, i) => (
          <WardPatientCardElement
            key={`ward-card-${patient.uuid}-header-${i}`}
            elementId={elementId}
            patient={patient}
            visit={visit}
            admitted={admitted}
            inpatientAdmission={inpatientAdmission}
            inpatientRequest={null}
          />
        ))}
        <ExtensionSlot name={headerExtensionSlotName} state={extensionSlotState} />
      </div>
      <ExtensionSlot
        name={rowsExtensionSlotName}
        state={extensionSlotState}
        className={classNames(styles.wardPatientCardRow, styles.wardPatientCardExtensionSlot)}
      />
      <div className={styles.wardPatientCardRow}>
        {footerRowElements.map((elementId, i) => (
          <WardPatientCardElement
            key={`ward-card-${patient.uuid}-footer-${i}`}
            elementId={elementId}
            patient={patient}
            visit={visit}
            admitted={admitted}
            inpatientAdmission={inpatientAdmission}
            inpatientRequest={null}
          />
        ))}
        <ExtensionSlot name={footerExtensionSlotName} state={extensionSlotState} />
      </div>
      <button
        className={styles.wardPatientCardButton}
        onClick={() => {
          launchWorkspace<WardPatientWorkspaceProps>('ward-patient-workspace', {
            patientUuid: patient.uuid,
            patient,
            visit,
            bed,
            admitted,
            inpatientAdmission,
            inpatientRequest: null,
          });
        }}>
        {/* Name will not be displayed; just there for a11y */}
        {getPatientName(patient.person)}
      </button>
    </div>
  );
};

export default WardPatientCard;
