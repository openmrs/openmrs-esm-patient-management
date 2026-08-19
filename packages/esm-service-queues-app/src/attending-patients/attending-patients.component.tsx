import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, SkeletonPlaceholder, Tag, Tile } from '@carbon/react';
import {
  age,
  ConfigurableLink,
  EmptyCardIllustration,
  ErrorState,
  getCoreTranslation,
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
    person?.gender ? getGenderLabel(person.gender) : null,
    person?.birthdate ? age(person.birthdate) : null,
  ]
    .filter(Boolean)
    .join(' · ');

  // One row per concern, so that a name wrapping onto a second line doesn't rearrange the card.
  return (
    <div className={styles.card}>
      <ConfigurableLink
        className={styles.cardLink}
        to={customPatientChartUrl}
        templateParams={{ patientUuid: queueEntry.patient.uuid }}>
        <PatientPhoto patientUuid={queueEntry.patient.uuid} patientName={person?.display ?? ''} />
        <div className={styles.details}>
          <span className={styles.name}>{person?.display}</span>
          <p className={styles.demographics}>{demographics}</p>
          <div className={styles.serviceRow}>
            <span className={styles.service}>{queueEntry.queue?.display}</span>
            <QueuePriority
              priority={queueEntry.priority}
              priorityComment={queueEntry.priorityComment ?? undefined}
              priorityConfigs={priorityConfigs}
            />
          </div>
        </div>
      </ConfigurableLink>
    </div>
  );
}

function getGenderLabel(gender: string) {
  switch (gender.charAt(0).toUpperCase()) {
    case 'F':
      return getCoreTranslation('female', 'Female');
    case 'M':
      return getCoreTranslation('male', 'Male');
    case 'O':
      return getCoreTranslation('other', 'Other');
    default:
      return getCoreTranslation('unknown', 'Unknown');
  }
}

export default AttendingPatients;
