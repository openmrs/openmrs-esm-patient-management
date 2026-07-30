import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SkeletonPlaceholder, Tag, Tile } from '@carbon/react';
import {
  age,
  ConfigurableLink,
  EmptyCardIllustration,
  ErrorState,
  formatDate,
  getCoreTranslation,
  parseDate,
  PatientPhoto,
  useConfig,
} from '@openmrs/esm-framework';
import QueuePriority from '../queue-table/components/queue-priority.component';
import { useQueueEntries } from '../hooks/useQueueEntries';
import { useServiceQueuesStore } from '../store/store';
import { type ConfigObject } from '../config-schema';
import { type QueueEntry } from '../types';
import styles from './attending-patients.scss';

const collapsedCardCount = 3;

// Renders patients currently being attended (queue entries with an "In Service" status) as cards.
const AttendingPatients: React.FC = () => {
  const { t } = useTranslation();
  const {
    concepts: { defaultTransitionStatus },
  } = useConfig<ConfigObject>();
  const { selectedServiceUuid, selectedQueueLocationUuid } = useServiceQueuesStore();
  const { queueEntries, isLoading, error } = useQueueEntries({
    service: selectedServiceUuid,
    location: selectedQueueLocationUuid,
    status: defaultTransitionStatus,
    isEnded: false,
  });
  const [showAll, setShowAll] = useState(false);

  const visibleEntries = showAll ? queueEntries : queueEntries.slice(0, collapsedCardCount);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.heading}>{t('attending', 'Attending')}</h4>
        {!isLoading && !error && <Tag type="gray">{queueEntries.length}</Tag>}
        {queueEntries.length > collapsedCardCount && (
          <Button
            className={styles.viewAllButton}
            kind="ghost"
            onClick={() => setShowAll((current) => !current)}
            size="sm">
            {showAll ? t('showLess', 'Show less') : t('viewAll', 'View all')}
          </Button>
        )}
      </div>
      {isLoading ? (
        <div className={styles.cards}>
          {Array.from({ length: collapsedCardCount }, (_, index) => (
            <SkeletonPlaceholder className={styles.cardSkeleton} key={index} />
          ))}
        </div>
      ) : error ? (
        <ErrorState error={error} headerTitle={t('attending', 'Attending')} />
      ) : queueEntries.length === 0 ? (
        <Tile className={styles.emptyState}>
          <EmptyCardIllustration />
          <p className={styles.emptyStateContent}>{t('noOneBeingAttended', 'No one is being attended')}</p>
        </Tile>
      ) : (
        <div className={styles.cards}>
          {visibleEntries.map((queueEntry) => (
            <AttendingPatientCard key={queueEntry.uuid} queueEntry={queueEntry} />
          ))}
        </div>
      )}
    </div>
  );
};

function AttendingPatientCard({ queueEntry }: { queueEntry: QueueEntry }) {
  const { customPatientChartUrl, priorityConfigs } = useConfig<ConfigObject>();
  const { person } = queueEntry.patient;

  const demographics = [
    person?.birthdate ? age(person.birthdate) : null,
    person?.birthdate ? formatDate(parseDate(person.birthdate), { time: false }) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={styles.card}>
      <ConfigurableLink
        className={styles.cardLink}
        to={customPatientChartUrl}
        templateParams={{ patientUuid: queueEntry.patient.uuid }}>
        <PatientPhoto patientUuid={queueEntry.patient.uuid} patientName={person?.display ?? ''} />
        <div className={styles.details}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{person?.display}</span>
            <GenderIndicator gender={person?.gender} />
            <QueuePriority
              priority={queueEntry.priority}
              priorityComment={queueEntry.priorityComment ?? undefined}
              priorityConfigs={priorityConfigs}
            />
          </div>
          <p className={styles.demographics}>{demographics}</p>
        </div>
      </ConfigurableLink>
    </div>
  );
}

function GenderIndicator({ gender }: { gender?: string }) {
  if (!gender) {
    return null;
  }
  const normalized = gender.charAt(0).toUpperCase();
  const label =
    normalized === 'F'
      ? getCoreTranslation('female', 'Female')
      : normalized === 'M'
        ? getCoreTranslation('male', 'Male')
        : normalized === 'O'
          ? getCoreTranslation('other', 'Other')
          : getCoreTranslation('unknown', 'Unknown');
  return <span className={styles.gender}>{label}</span>;
}

export default AttendingPatients;
