import React from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { AddIcon } from '@openmrs/esm-framework';
import { CardHeader, EmptyDataIllustration, ErrorState } from '@openmrs/esm-patient-common-lib';
import styles from './patient-history-card.style.scss';
import { useTranslation } from 'react-i18next';

export interface PatientHistoryCardProps {
  patientUuid: string;
}

export function PatientHistoryCard({ patientUuid }: PatientHistoryCardProps) {
  const { t } = useTranslation();
  const isValidating = false;
  const headerTitle = 'Medical and obstetric history';

  return (
    <div className={styles.widgetCard}>
      <CardHeader title={headerTitle}>
        <span>{isValidating ? <InlineLoading /> : null}</span>
      </CardHeader>
    </div>
  );
}
