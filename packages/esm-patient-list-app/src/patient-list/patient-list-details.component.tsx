import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot } from '@openmrs/esm-framework';
import CustomOverflowMenu from '../ui-components/overflow-menu.component';
import OverflowMenuVertical16 from '@carbon/icons-react/es/overflow-menu--vertical/16';
import PatientListDataTable from '../patient-table/patient-table.component';
import styles from './patient-list-detail.scss';

const PatientListDetails: React.FC<{}> = () => {
  const { t } = useTranslation();

  return (
    <div className="omrs-main-content">
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      <div className={styles.patientListBanner}>
        <div className={styles.leftBannerSection}>
          <h5 className={styles.bodyShort02}>
            {t("A list of patients that haven't been seen for 30 days, since their missed appointment")}
          </h5>
          <div className={`${styles.secondaryText} ${styles.bodyShort01}`} style={{ marginTop: '0.5rem' }}>
            <span>128 {t('patients', 'patients')}</span> · <span className={styles.label01}>Last Updated:</span> 12 /
            Oct / 2020
          </div>
        </div>
        <div className={styles.rightBannerSection}>
          <CustomOverflowMenu
            menuTitle={
              <>
                <span className={styles.actionsButtonText}>{t('actions', 'Actions')}</span>{' '}
                <OverflowMenuVertical16 style={{ marginLeft: '0.5rem' }} />
              </>
            }>
            <ExtensionSlot extensionSlotName="patient-list-actions-slot" />
          </CustomOverflowMenu>
        </div>
      </div>
    </div>
  );
};

export default PatientListDetails;
