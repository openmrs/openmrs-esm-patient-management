import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from '@carbon/react';
import { CheckmarkOutline, PendingFilled, WarningAltFilled } from '@carbon/react/icons';
import {
  getOfflinePatientDataStore,
  navigate,
  OfflinePatientDataSyncState,
  OfflinePatientDataSyncStore,
  useStore,
} from '@openmrs/esm-framework';
import styles from './last-updated-table-cell.scss';

export interface LastUpdatedTableCellProps {
  patientUuid: string;
  syncState?: OfflinePatientDataSyncState;
}

const LastUpdatedTableCell: React.FC<LastUpdatedTableCellProps> = ({ patientUuid, syncState }) => {
  const { t } = useTranslation();
  const store = useStore(getOfflinePatientDataStore());

  const InnerContent = () => {
    if (!syncState) {
      return (
        <>
          <WarningAltFilled size={16} className={styles.errorIcon} />
          {t('offlinePatientsTableLastUpdatedNotYetSynchronized', 'Not synchronized')}
        </>
      );
    }

    if (hasNewUnknownHandlers(store, syncState)) {
      return (
        <>
          <WarningAltFilled size={16} className={styles.errorIcon} />
          {t('offlinePatientsTableLastUpdatedOutdatedData', 'Outdated data')}
        </>
      );
    }

    if (syncState.syncingHandlers.length > 0) {
      return (
        <>
          <PendingFilled size={16} className={styles.pendingIcon} />
          {t('offlinePatientsTableLastUpdatedDownloading', 'Downloading...')}
        </>
      );
    }

    if (syncState.failedHandlers.length > 0) {
      return (
        <>
          <WarningAltFilled size={16} className={styles.errorIcon} />
          <Link
            onClick={() =>
              navigate({ to: `${window.getOpenmrsSpaBase()}offline-tools/patients/${patientUuid}/offline-data` })
            }>
            {syncState.failedHandlers.length}{' '}
            {syncState.failedHandlers.length === 1
              ? t('offlinePatientsTableLastUpdatedError', 'error')
              : t('offlinePatientsTableLastUpdatedErrors', 'errors')}
          </Link>
        </>
      );
    }

    return (
      <>
        <CheckmarkOutline size={16} />
        {syncState.timestamp.toLocaleDateString()}
      </>
    );
  };

  return (
    <div className={styles.cellContainer}>
      <InnerContent />
    </div>
  );
};

function hasNewUnknownHandlers(store: OfflinePatientDataSyncStore, syncState?: OfflinePatientDataSyncState) {
  if (!syncState) {
    return false;
  }

  const allCurrentHandlers = [...syncState.syncingHandlers, ...syncState.syncedHandlers, ...syncState.failedHandlers];
  return Object.keys(store.handlers).some((identifier) => !allCurrentHandlers.includes(identifier));
}

export default LastUpdatedTableCell;
