import React from 'react';
import {
  getOfflinePatientDataStore,
  navigate,
  OfflinePatientDataSyncState,
  OfflinePatientDataSyncStore,
  useStore,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import PendingFilled16 from '@carbon/icons-react/es/pending--filled/16';
import WarningAltFilled16 from '@carbon/icons-react/es/warning--alt--filled/16';
import CheckmarkOutline16 from '@carbon/icons-react/es/checkmark--outline/16';
import styles from './last-updated-table-cell.scss';
import { Link, TableCell } from 'carbon-components-react';

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
          <WarningAltFilled16 className={styles.errorIcon} />
          {t('offlinePatientsTableLastUpdatedNotYetSynchronized', 'Not synchronized')}
        </>
      );
    }

    if (hasNewUnknownHandlers(store, syncState)) {
      return (
        <>
          <WarningAltFilled16 className={styles.errorIcon} />
          {t('offlinePatientsTableLastUpdatedOutdatedData', 'Outdated data')}
        </>
      );
    }

    if (syncState.syncingHandlers.length > 0) {
      return (
        <>
          <PendingFilled16 className={styles.pendingIcon} />
          {t('offlinePatientsTableLastUpdatedDownloading', 'Downloading...')}
        </>
      );
    }

    if (syncState.failedHandlers.length > 0) {
      return (
        <>
          <WarningAltFilled16 className={styles.errorIcon} />
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
        <CheckmarkOutline16 />
        {syncState.timestamp.toLocaleDateString()}
      </>
    );
  };

  return (
    <TableCell>
      <div className={styles.cellContainer}>
        <InnerContent />
      </div>
    </TableCell>
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
