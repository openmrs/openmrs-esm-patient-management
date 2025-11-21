import { ContentSwitcher, Switch } from '@carbon/react';
import { closeWorkspaceGroup2, useFeatureFlag, Workspace2, Workspace2DefinitionProps } from '@openmrs/esm-framework';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { WardPatientWorkspaceDefinition, WardPatientWorkspaceProps } from '../../types';
import WardPatientWorkspaceBanner from '../patient-banner/patient-banner.component';
import PatientAdmitOrTransferForm, {
  type PatientAdmitOrTransferFormProps,
} from './patient-admit-or-transfer-request-form.component';
import PatientBedSwapForm from './patient-bed-swap-form.component';
import styles from './patient-transfer-swap.scss';

const TransferSection = {
  TRANSFER: 'transfer',
  BED_SWAP: 'bed-swap',
} as const;

type TransferSectionValues = (typeof TransferSection)[keyof typeof TransferSection];

/**
 * This workspace opens the form to either transfer a patient to a different ward location
 * or to change their currently assigned bed
 */
export default function PatientTransferAndSwapWorkspace({
  groupProps: { wardPatient },
  closeWorkspace,
}: WardPatientWorkspaceDefinition) {
  const { t } = useTranslation();
  const [selectedSection, setSelectedSection] = useState<TransferSectionValues>(TransferSection.TRANSFER);
  const isBedManagementModuleInstalled = useFeatureFlag('bedmanagement-module');

  const props: PatientAdmitOrTransferFormProps = {
    wardPatient,
    onSuccess: async () => {
      await closeWorkspace({ discardUnsavedChanges: true });
      closeWorkspaceGroup2();
    },
    onCancel: () => {
      closeWorkspace();
    },
  };

  return (
    <Workspace2 title={t('transfers', 'Transfers')}>
      <div className={styles.flexWrapper}>
        <div className={styles.patientWorkspaceBanner}>
          <WardPatientWorkspaceBanner wardPatient={wardPatient} />
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
            <PatientAdmitOrTransferForm {...props} />
          ) : (
            <PatientBedSwapForm {...props} />
          )}
        </div>
      </div>
    </Workspace2>
  );
}
