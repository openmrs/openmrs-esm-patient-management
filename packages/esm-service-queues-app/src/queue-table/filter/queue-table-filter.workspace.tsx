import React, { useState } from 'react';
import styles from './queue-table-filters.scss';
import { Dropdown } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash-es';
import {
  updateSelectedQueuePriority,
  updateSelectedQueueStatus,
  updateSelectedServiceName,
  updateSelectedServiceUuid,
  useSelectedPriority,
  useSelectedQueueLocationUuid,
  useSelectedServiceName,
  useSelectedStatus,
} from '../../helpers/helpers';
import { ExtensionSlot, isDesktop, useLayoutType, usePatient } from '@openmrs/esm-framework';
import { useQueueStatuses } from '../../hooks/useQueueStatus';
import { DropdownSkeleton } from '@carbon/react';
import { useQueues } from '../../hooks/useQueues';
import { useQueuePriorities } from '../../hooks/useQueuePriorities';

function QueueStatusFilter() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { statuses = [], isLoadingStatuses } = useQueueStatuses();
  const { statusUuid } = useSelectedStatus();

  const handleStatusSelection = debounce(({ selectedItem }) => {
    updateSelectedQueueStatus(selectedItem?.uuid);
  }, 300);

  const DropdownComponent = isLoadingStatuses ? DropdownSkeleton : Dropdown;

  return (
    <>
      <div className={styles.filterContainer}>
        <DropdownComponent
          id="priorityFilter"
          titleText={t('filterPatientsByStatus', 'Status')}
          label={statuses?.find((priority) => priority.uuid === statusUuid)?.display || t('all', 'All')}
          items={[{ display: `${t('all', 'All')}` }, ...statuses]}
          itemToString={(item) => (item ? item.display : '')}
          onChange={handleStatusSelection}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          selectedItem={statuses?.find((status) => status.uuid === statusUuid)}
        />
      </div>
    </>
  );
}

export function QueueLocationFilter() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const currentQueueLocation = useSelectedQueueLocationUuid();
  const { queues } = useQueues(currentQueueLocation);
  const currentServiceName = useSelectedServiceName();
  const handleServiceChange = ({ selectedItem }) => {
    updateSelectedServiceUuid(selectedItem.uuid);
    updateSelectedServiceName(selectedItem.display);
  };

  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="serviceFilter"
          titleText={t('showPatientsWaitingFor', 'Show patients waiting for:')}
          label={currentServiceName}
          type="inline"
          items={[{ display: `${t('all', 'All')}` }, ...queues]}
          itemToString={(item) => (item ? item.display : '')}
          onChange={handleServiceChange}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          selectedItem={queues.find((queue) => queue.uuid === currentQueueLocation)}
        />
      </div>
    </>
  );
}

function QueuePriorityFilter() {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const { priorities = [], isLoadingPriorities } = useQueuePriorities();
  const { priorityUuid } = useSelectedPriority();

  const handlePriorityChange = debounce(({ selectedItem }) => {
    updateSelectedQueuePriority(selectedItem?.uuid);
  }, 300);

  return (
    <>
      <div className={styles.filterContainer}>
        <Dropdown
          id="priorityFilter"
          titleText={t('filterPatientsByPriorty', 'Filter patients for priority:')}
          label={priorities?.find((priority) => priority.uuid === priorityUuid)?.display || t('all', 'All')}
          items={[{ display: `${t('all', 'All')}` }, ...priorities]}
          itemToString={(item) => (item ? item.display : '')}
          onChange={handlePriorityChange}
          size={isDesktop(layout) ? 'sm' : 'lg'}
          disabled={isLoadingPriorities}
          selectedItem={priorities?.find((priority) => priority.uuid === priorityUuid)}
        />
      </div>
    </>
  );
}

export function QueueSearchPatient() {
  const { t } = useTranslation();
  const [selectedPatientUuid, setSelectedPatientUuid] = useState<string>(null);
  const { patient } = usePatient(selectedPatientUuid);

  const handlePatientSelection = (patientUuid: string) => {
    setSelectedPatientUuid(patientUuid);
  };

  if (patient) {
    return patient?.name?.[0]?.given.join(' ') + ' ' + patient?.name?.[0]?.family;
  }

  return (
    <ExtensionSlot
      name="patient-search-button"
      state={{
        buttonText: t('searchPatientByNameOrId', 'Search patient by name or Identifier'),
        selectPatientAction: handlePatientSelection,
        buttonProps: {
          kind: 'ghost',
        },
      }}
    />
  );
}

interface QueueFilterWorkspaceProps {
  queueTableName: string;
}

export default function QueueEntriesFilterWorkspace({ queueTableName }: QueueFilterWorkspaceProps) {
  return (
    <div className={styles.queueFilterWorkspaceContainer}>
      <QueueLocationFilter />
      <QueueStatusFilter />
      <QueuePriorityFilter />
    </div>
  );
}
