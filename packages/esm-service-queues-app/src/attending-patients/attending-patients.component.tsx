import React from 'react';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';
import { ConfigurableLink, PatientPhoto, useConfig } from '@openmrs/esm-framework';
import { useQueueEntries } from '../hooks/useQueueEntries';
import { useServiceQueuesStore } from '../store/store';
import QueuePriority from '../queue-table/components/queue-priority.component';
import { type ConfigObject } from '../config-schema';
import { type QueueEntry } from '../types';
import styles from './attending-patients.scss';

// Renders patients currently being attended (queue entries with an "In Service" status) as cards.
const AttendingPatients: React.FC = () => {
  const { t } = useTranslation();
  const {
    concepts: { defaultTransitionStatus },
  } = useConfig<ConfigObject>();
  const { selectedServiceUuid, selectedQueueLocationUuid } = useServiceQueuesStore();
  const { queueEntries } = useQueueEntries({
    service: selectedServiceUuid,
    location: selectedQueueLocationUuid,
    status: defaultTransitionStatus,
    isEnded: false,
  });

  if (!queueEntries?.length) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4 className={styles.heading}>{t('attending', 'Attending')}</h4>
        <Tag type="gray">{queueEntries.length}</Tag>
      </div>
      <div className={styles.cards}>
        {queueEntries.map((queueEntry) => (
          <AttendingPatientCard key={queueEntry.uuid} queueEntry={queueEntry} />
        ))}
      </div>
    </div>
  );
};

function AttendingPatientCard({ queueEntry }: { queueEntry: QueueEntry }) {
  const { t } = useTranslation();
  const { customPatientChartUrl, priorityConfigs } = useConfig<ConfigObject>();
  const { person } = queueEntry.patient;
  const age = person?.birthdate ? dayjs().diff(dayjs(person.birthdate), 'years') : null;

  const demographics = [
    age != null ? t('ageYearsOld', '{{age}} years old', { age }) : null,
    person?.birthdate ? dayjs(person.birthdate).format('DD-MM-YYYY') : null,
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
  const symbol = normalized === 'F' ? '♀' : normalized === 'M' ? '♂' : '⚧';
  return (
    <span className={styles.gender}>
      {symbol} {normalized.toLowerCase()}
    </span>
  );
}

export default AttendingPatients;
