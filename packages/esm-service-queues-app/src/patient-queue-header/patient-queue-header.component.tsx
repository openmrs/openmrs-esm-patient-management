import React from 'react';
import { useTranslation } from 'react-i18next';
import { useConfig, PageHeader, PageHeaderContent, ServiceQueuesPictogram } from '@openmrs/esm-framework';
import type { ConfigObject } from '../config-schema';
import styles from './patient-queue-header.scss';

interface PatientQueueHeaderProps {
  title?: string | JSX.Element;
  actions?: React.ReactNode;
}

const PatientQueueHeader: React.FC<PatientQueueHeaderProps> = ({ title, actions }) => {
  const { t } = useTranslation();
  const { dashboardTitle } = useConfig<ConfigObject>();

  return (
    <PageHeader className={styles.header} data-testid="patient-queue-header">
      <PageHeaderContent
        title={title ? title : t(dashboardTitle.key, dashboardTitle.value)}
        illustration={<ServiceQueuesPictogram />}
      />
      {actions && <div className={styles.actionsContainer}>{actions}</div>}
    </PageHeader>
  );
};

export default PatientQueueHeader;
