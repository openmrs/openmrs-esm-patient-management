import React, { useCallback, useMemo } from 'react';
import { Button } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { showSnackbar, useConfig, useVisit } from '@openmrs/esm-framework';
import { useServiceQueuesStore } from '../store/store';
import { postQueueEntry } from '../create-queue-entry/queue-fields/queue-fields.resource';
import { type ConfigObject } from '../config-schema';
import { useQueues } from '../hooks/useQueues';
import { DUPLICATE_QUEUE_ENTRY_ERROR_CODE } from '../constants';

interface AddPatientToQueueButtonProps {
  patientUuid: string;
}

const AddPatientToQueueButton: React.FC<AddPatientToQueueButtonProps> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { selectedServiceUuid, selectedQueueLocationUuid } = useServiceQueuesStore();
  const config = useConfig<ConfigObject>();
  const { activeVisit } = useVisit(patientUuid);
  const { queues } = useQueues(selectedQueueLocationUuid);

  const selectedQueue = useMemo(
    () => queues.find((q) => q.service.uuid === selectedServiceUuid),
    [queues, selectedServiceUuid],
  );

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
        subtitle: t('queueNotFoundForService', 'Could not find a queue for the selected service'),
      });
      return;
    }

    if (!activeVisit) {
      showSnackbar({
        title: t('noActiveVisit', 'No active visit'),
        kind: 'error',
        subtitle: t('startVisitFirst', 'Please start a visit for this patient first'),
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

      showSnackbar({
        title: t('patientAddedToQueue', 'Patient added to queue'),
        kind: 'success',
        isLowContrast: true,
      });
    } catch (error) {
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
  }, [patientUuid, selectedServiceUuid, selectedQueueLocationUuid, config, t, activeVisit, selectedQueue]);

  return (
    <Button kind="primary" onClick={handleAddToQueue} style={{ marginRight: '0.5rem' }}>
      {t('addToQueue', 'Add to queue')}
    </Button>
  );
};

export default AddPatientToQueueButton;
