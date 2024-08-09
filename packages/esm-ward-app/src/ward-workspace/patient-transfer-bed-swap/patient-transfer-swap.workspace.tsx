import React, { useState } from 'react';
import { useFeatureFlag } from '@openmrs/esm-framework';
import { ContentSwitcher, Switch } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import PatientTransferForm from './patient-transfer-request-form.component';
import PatientBedSwapForm from './patient-bed-swap-form.component';
import styles from './patient-transfer-swap.scss';
import type { WardPatientWorkspaceProps } from '../../ward-patient-workspace/types';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';

const TransferSection = {
  TRANSFER: 'transfer',
  BED_SWAP: 'bed-swap',
} as const;

type TransferSectionValues = (typeof TransferSection)[keyof typeof TransferSection];

export default function PatientTransferAndSwapWorkspace(props: WardPatientWorkspaceProps) {
  const { t } = useTranslation();
  const [selectedSection, setSelectedSection] = useState<TransferSectionValues>(TransferSection.TRANSFER);
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');

  return (
    <div className={styles.workspaceContent}>
      <WardPatientWorkspaceBanner {...props} />
      {isBedManagementModuleInstalled && (
        <div>
          <h2 className={styles.productiveHeading02}>{t('typeOfTransfer', 'Type of transfer')}</h2>
          <div className={styles.contentSwitcher}>
            <ContentSwitcher onChange={({ name }) => setSelectedSection(name)}>
              <Switch name={TransferSection.TRANSFER} text={t('transfer', 'Transfer')} />
              <Switch name={TransferSection.BED_SWAP} text={t('bedSwap', 'Bed swap')} />
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
