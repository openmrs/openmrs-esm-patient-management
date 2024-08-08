import React, { useState } from 'react';
import { getGlobalStore, useFeatureFlag, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import { ContentSwitcher, Switch } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import PatientTransferForm from './patient-transfer-form.component';
import PatientBedSwapForm from './patient-bed-swap-form.component';
import styles from './patient-transfer-swap.scss';
import type { WardPatientWorkspaceProps } from '../../ward-patient-workspace/types';

type TransferSection = 'transfer' | 'bed-swap';

export default function PatientTransferAndSwapWorkspace(props: WardPatientWorkspaceProps) {
  const { t } = useTranslation();
  const [selectedSection, setSelectedSection] = useState<TransferSection>('transfer');
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');

  return (
    <div className={styles.workspaceContent}>
      {isBedManagementModuleInstalled && (
        <div>
          <h2 className={styles.productiveHeading02}>{t('typeOfTransfer', 'Type of transfer')}</h2>
          <div className={styles.contentSwitcher}>
            <ContentSwitcher onChange={({ name }) => setSelectedSection(name)}>
              <Switch name={'transfer' as TransferSection} text={t('transfer', 'Transfer')} />
              <Switch name={'bed-swap' as TransferSection} text={t('bedSwap', 'Bed swap')} />
            </ContentSwitcher>
          </div>
        </div>
      )}
      <div className={styles.workspaceForm}>
        {selectedSection === 'transfer' ? <PatientTransferForm {...props} /> : <PatientBedSwapForm {...props} />}
      </div>
    </div>
  );
}
