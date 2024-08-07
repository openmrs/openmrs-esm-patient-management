import React, { useState } from 'react';
import { getGlobalStore, type DefaultWorkspaceProps } from '@openmrs/esm-framework';
import { ContentSwitcher, Switch } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import PatientTransferForm from './patient-transfer-form.component';
import PatientBedSwapForm from './patient-bed-swap-form.component';
import type { PatientTransferAndSwapWorkspaceProps } from './types';
import styles from './patient-transfer-swap.scss';

type TransferSection = 'transfer' | 'bed-swap';

export default function PatientTransferAndSwapWorkspace(props: PatientTransferAndSwapWorkspaceProps) {
  const { t } = useTranslation();
  const [selectedSection, setSelectedSection] = useState<TransferSection>('transfer');
  return (
    <div className={styles.workspaceContent}>
      <ContentSwitcher onChange={({ name }) => setSelectedSection(name)}>
        <Switch name={'transfer' as TransferSection} text={t('transfer', 'Transfer')} />
        <Switch name={'bed-swap' as TransferSection} text={t('bedSwap', 'Bed swap')} />
      </ContentSwitcher>
      <div className={styles.workspaceForm}>
        {selectedSection === 'transfer' ? <PatientTransferForm {...props} /> : <PatientBedSwapForm {...props} />}
      </div>
    </div>
  );
}
