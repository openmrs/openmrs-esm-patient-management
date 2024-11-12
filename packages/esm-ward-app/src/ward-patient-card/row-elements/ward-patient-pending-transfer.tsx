import React, { useMemo } from 'react';
import { Movement } from '@carbon/react/icons';
import styles from '../ward-patient-card.scss';
import { useTranslation } from 'react-i18next';
import { type WardPatientWorkspaceProps, type WardViewContext, type WardPatient } from '../../types';
import { CloseOutlineIcon, launchWorkspace, useAppContext } from '@openmrs/esm-framework';
import { Button } from '@carbon/react';

export interface WardPatientTransferProps {
  wardPatient: WardPatient;
}

const WardPatientPendingTransfer: React.FC<WardPatientTransferProps> = ({ wardPatient }) => {
  const { t } = useTranslation();
  const { WardPatientHeader } = useAppContext<WardViewContext>('ward-view-context') ?? {};

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
  }, [dispositionType, dispositionLocation]);

  const launchCancelAdmissionForm = () => {
    launchWorkspace<WardPatientWorkspaceProps>('cancel-admission-request-workspace', {
      wardPatient,
      WardPatientHeader,
    });
  };

  if (!(dispositionType === 'TRANSFER' || dispositionType === 'DISCHARGE')) return null;

  return (
    <div className={styles.wardPatientCardDispositionTypeContainer}>
      <Movement className={styles.movementIcon} size={24} />
      {message}
      <Button
        hasIconOnly
        iconDescription={t('cancel', 'Cancel')}
        kind={'secondary'}
        className={styles.cancelTransferRequestButton}
        size={'sm'}
        onClick={launchCancelAdmissionForm}
        renderIcon={(props) => <CloseOutlineIcon {...props} />}></Button>
    </div>
  );
};

export default WardPatientPendingTransfer;
