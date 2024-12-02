import { ContentSwitcher, Switch } from '@carbon/react';
import { useFeatureFlag } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { WardPatientWorkspaceProps } from '../../types';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import PatientBedSwapForm from './patient-bed-swap-form.component';
import PatientTransferForm from './patient-transfer-request-form.component';
import styles from './patient-transfer-swap.scss';

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
    <div className={styles.flexWrapper}>
      <div className={styles.patientWorkspaceBanner}>
        <WardPatientWorkspaceBanner wardPatient={props?.wardPatient} />
      </div>
      {isBedManagementModuleInstalled && (
        <div className={styles.contentSwitcherWrapper}>
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
        {selectedSection === TransferSection.TRANSFER ? (
          <PatientTransferForm {...props} />
        ) : (
          <PatientBedSwapForm {...props} />
        )}
      </div>
    </div>
  );
}
