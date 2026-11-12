import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, InlineNotification, Stack } from '@carbon/react';
import { ArrowLeftIcon, ExtensionSlot, type Patient } from '@openmrs/esm-framework';
import styles from './create-admission-encounter.scss';

interface NoActiveVisitEmptyStateProps {
  patientUuid: string;
  patient: Patient;
  launchStartVisitWorkspace: (workspaceProps?: object) => Promise<void>;
  closeWorkspace: () => void;
}

const NoActiveVisitEmptyState: React.FC<NoActiveVisitEmptyStateProps> = ({
  patientUuid,
  patient,
  launchStartVisitWorkspace,
  closeWorkspace,
}) => {
  const { t } = useTranslation();

  return (
    <Stack className={styles.noActiveVisitContent} gap={4}>
      <InlineNotification
        hideCloseButton
        kind="info"
        lowContrast
        subtitle={t('visitRequiredToAdmitPatient', 'A visit is required to admit this patient to the ward')}
      />
      <ExtensionSlot
        name="start-visit-button-slot2"
        state={{
          patientUuid,
          patient,
          launchStartVisitWorkspace,
        }}
      />
      <Button
        className={styles.backButton}
        kind="ghost"
        renderIcon={(props) => <ArrowLeftIcon size={16} {...props} />}
        iconDescription={t('backToSearchResults', 'Back to search results')}
        size="sm"
        onClick={() => closeWorkspace()}>
        <span>{t('backToSearchResults', 'Back to search results')}</span>
      </Button>
    </Stack>
  );
};

export default NoActiveVisitEmptyState;
