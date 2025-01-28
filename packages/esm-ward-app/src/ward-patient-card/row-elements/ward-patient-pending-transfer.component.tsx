import { IconButton } from '@carbon/react';
import { Movement } from '@carbon/react/icons';
import { CloseOutlineIcon, launchWorkspace } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { type WardPatient, type WardPatientWorkspaceProps } from '../../types';
import styles from '../ward-patient-card.scss';

export interface WardPatientTransferProps {
  wardPatient: WardPatient;
}

const WardPatientPendingTransfer: React.FC<WardPatientTransferProps> = ({ wardPatient }) => {
  const { t } = useTranslation();

  const { dispositionType, dispositionLocation } = wardPatient?.inpatientRequest;
  const message = useMemo(() => {
    if (dispositionType === 'TRANSFER') {
      if (dispositionLocation) {
        return t('transferToDispositionLocation', 'Transfer to {{location}}', { location: dispositionLocation.name });
      }
      return t('pendingTransfer', 'Pending Transfer');
    }
    if (dispositionType === 'DISCHARGE') {
      return t('pendingDischarge', 'Pending Discharge');
    }
    return '';
  }, [dispositionType, dispositionLocation, t]);

  const launchCancelAdmissionForm = () => {
    launchWorkspace<WardPatientWorkspaceProps>('cancel-admission-request-workspace', {
      wardPatient,
    });
  };

  if (!(dispositionType === 'TRANSFER' || dispositionType === 'DISCHARGE')) return null;

  return (
    <div className={styles.wardPatientCardDispositionTypeContainer}>
      <Movement className={styles.movementIcon} size={24} />
      {message}
      <IconButton
        label={t('cancel', 'Cancel')}
        kind={'secondary'}
        className={styles.cancelTransferRequestButton}
        size={'sm'}
        onClick={launchCancelAdmissionForm}>
        <CloseOutlineIcon />
      </IconButton>
    </div>
  );
};

export default WardPatientPendingTransfer;
