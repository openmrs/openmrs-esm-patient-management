import React, { useCallback, useMemo } from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig, useVisit } from '@openmrs/esm-framework';
import { useServiceQueuesStore } from '../store/store';
import { postQueueEntry } from '../create-queue-entry/queue-fields/queue-fields.resource';
import { type ConfigObject } from '../config-schema';
import { useQueues } from '../hooks/useQueues';
import { useMutateQueueEntries, useQueueEntries } from '../hooks/useQueueEntries';
import { DUPLICATE_QUEUE_ENTRY_ERROR_CODE } from '../constants';
import { updateQueueEntry } from '../modals/queue-entry-actions.resource';
import styles from './add-to-queue-button.scss';

interface AddPatientToQueueButtonProps {
  patientUuid: string;
}

const AddPatientToQueueButton: React.FC<AddPatientToQueueButtonProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const [optimisticStatus, setOptimisticStatus] = React.useState<'queued' | 'not_queued' | null>(null);
  const { selectedServiceUuid, selectedQueueLocationUuid } = useServiceQueuesStore();
  const config = useConfig<ConfigObject>();
  const { activeVisit, mutate: mutateVisit } = useVisit(patientUuid);
  const { queues } = useQueues(selectedQueueLocationUuid);
  const { mutateQueueEntries } = useMutateQueueEntries();
  const { queueEntries, mutate: mutateQueueEntriesList } = useQueueEntries({
    patient: patientUuid,
    isEnded: false,
  });

  const selectedQueue = useMemo(
    () => queues.find((q) => q.service.uuid === selectedServiceUuid),
    [queues, selectedServiceUuid],
  );

  const existingQueueEntry = useMemo(
    () => queueEntries.find((entry) => entry.queue?.uuid === selectedQueue?.uuid),
    [queueEntries, selectedQueue],
  );

  const isPatientInQueue = optimisticStatus !== null ? optimisticStatus === 'queued' : !!existingQueueEntry;

  React.useEffect(() => {
    let intervalId;
    if (!activeVisit) {
      intervalId = setInterval(() => {
        mutateVisit();
      }, 1000);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [activeVisit, mutateVisit]);

  const handleAddToQueue = useCallback(async () => {
    if (!selectedServiceUuid) {
      showSnackbar({
        title: t('noServiceSelected', 'No service selected'),
        kind: 'error',
        subtitle: t('selectServiceFirst', 'Please select a service first'),
      });
      return;
    }

    if (!selectedQueue) {
      showSnackbar({
        title: t('queueNotFound', 'Queue not found'),
        kind: 'error',
        subtitle: t('queueNotFoundForSelectedService', 'Could not find a queue for the selected service'),
      });
      return;
    }

    if (!activeVisit) {
      showSnackbar({
        title: t('noActiveVisit', 'No active visit'),
        kind: 'error',
        subtitle: t('startVisitFirstForThisPatient', 'Please start a visit for this patient first'),
      });
      return;
    }

    const { defaultPriorityConceptUuid, defaultStatusConceptUuid } = config.concepts;
    const { visitQueueNumberAttributeUuid } = config;
    const { allowedPriorities, allowedStatuses, uuid: queueUuid } = selectedQueue;

    const priorityUuid =
      allowedPriorities?.find((p) => p.uuid === defaultPriorityConceptUuid)?.uuid ||
      allowedPriorities?.[0]?.uuid ||
      defaultPriorityConceptUuid;

    const statusUuid =
      allowedStatuses?.find((s) => s.uuid === defaultStatusConceptUuid)?.uuid ||
      allowedStatuses?.[0]?.uuid ||
      defaultStatusConceptUuid;

    setOptimisticStatus('queued');

    try {
      await postQueueEntry(
        activeVisit.uuid,
        queueUuid,
        patientUuid,
        priorityUuid,
        statusUuid,
        0,
        selectedQueueLocationUuid,
        visitQueueNumberAttributeUuid,
      );

      await mutateQueueEntries();
      await mutateQueueEntriesList();

      setOptimisticStatus(null);

      showSnackbar({
        title: t('patientAddedToQueue', 'Patient added to queue'),
        kind: 'success',
        isLowContrast: true,
      });
    } catch (error) {
      setOptimisticStatus(null);
      const errorMessage = error?.responseBody?.error?.message || error?.message || '';
      const isDuplicate = errorMessage.includes(DUPLICATE_QUEUE_ENTRY_ERROR_CODE);

      showSnackbar({
        title: isDuplicate
          ? t('patientAlreadyInQueue', 'Patient already in queue')
          : t('errorAddingPatient', 'Error adding patient to queue'),
        kind: isDuplicate ? 'warning' : 'error',
        subtitle: isDuplicate
          ? t('duplicateQueueEntry', 'This patient is already in the selected queue.')
          : errorMessage,
        isLowContrast: !isDuplicate,
      });
    }
  }, [
    patientUuid,
    selectedServiceUuid,
    selectedQueueLocationUuid,
    config,
    t,
    activeVisit,
    selectedQueue,
    mutateQueueEntries,
    mutateQueueEntriesList,
  ]);

  const handleRemoveFromQueue = useCallback(async () => {
    if (!existingQueueEntry) return;

    setOptimisticStatus('not_queued');

    try {
      await updateQueueEntry(existingQueueEntry.uuid, {
        endedAt: new Date().toISOString(),
      });

      await mutateQueueEntries();
      await mutateQueueEntriesList();

      setOptimisticStatus(null);

      showSnackbar({
        title: t('patientRemovedFromQueue', 'Patient removed from queue'),
        kind: 'success',
        isLowContrast: true,
      });
    } catch (error) {
      setOptimisticStatus(null);
      showSnackbar({
        title: t('errorRemovingPatientFromQueue', 'Error, removing patient from queue'),
        kind: 'error',
        subtitle: error?.message,
      });
    }
  }, [existingQueueEntry, mutateQueueEntries, mutateQueueEntriesList, t]);

  const handleButtonClick = useCallback(() => {
    if (isPatientInQueue) {
      handleRemoveFromQueue();
    } else {
      handleAddToQueue();
    }
  }, [isPatientInQueue, handleAddToQueue, handleRemoveFromQueue]);

  if (!activeVisit) {
    return null;
  }

  return (
    <Button
      kind={isPatientInQueue ? 'ghost' : 'primary'}
      className={isPatientInQueue ? styles.removeButton : ''}
      onClick={handleButtonClick}>
      {isPatientInQueue ? t('removeFromQueue', 'Remove from queue') : t('addToQueue', 'Add to queue')}
    </Button>
  );
};

export default AddPatientToQueueButton;
