import React, { useCallback, useState } from 'react';
import {
  Button,
  InlineLoading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  FormGroup,
  RadioButton,
  RadioButtonGroup,
  ContentSwitcher,
  Switch,
} from '@carbon/react';
import { showNotification, showToast, toDateObjectStrict, toOmrsIsoString } from '@openmrs/esm-framework';
import { MappedVisitQueueEntry, updateQueueEntry, usePriority, useStatus } from './active-visits-table.resource';
import { useTranslation } from 'react-i18next';
import styles from './change-status-dialog.scss';
import { useSWRConfig } from 'swr';

interface ChangeStatusDialogProps {
  queueEntry: MappedVisitQueueEntry;
  closeModal: () => void;
}

const ChangeStatus: React.FC<ChangeStatusDialogProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();

  const [status, setStatus] = useState(queueEntry.statusUuid);
  const [priority, setPriority] = useState(queueEntry.priorityUuid);
  const [visitUuid, setVisitUuid] = useState(queueEntry.visitUuid);
  const [queueUuid, setQueueUuid] = useState(queueEntry.queueUuid);
  const [queueEntryUuid, setQueueEntryUuid] = useState(queueEntry.queueEntryUuid);
  const [patientUuid, setPatientUuid] = useState(queueEntry.patientUuid);
  const { priorities } = usePriority();
  const { statuses, isLoading } = useStatus();
  const { mutate } = useSWRConfig();

  const changeQueueStatus = useCallback(() => {
    if (priority === '') {
      setPriority([...priorities].shift().uuid);
    }
    if (status === '') {
      statuses.find((data) => data.display.toLowerCase() === 'waiting').uuid;
    }
    const endDate = toDateObjectStrict(toOmrsIsoString(new Date()));
    updateQueueEntry(
      visitUuid,
      queueUuid,
      queueEntryUuid,
      patientUuid,
      priority,
      status,
      endDate,
      new AbortController(),
    ).then(
      ({ status }) => {
        if (status === 201) {
          showToast({
            title: t('updateEntry', 'Update entry'),
            kind: 'success',
            description: t('queueEntryUpdateSuccessfully', 'Queue Entry Updated Successfully'),
          });
          closeModal();
          mutate(`/ws/rest/v1/visit-queue-entry?v=full`);
        }
      },
      (error) => {
        showNotification({
          title: t('queueEntryUpdateFailed', 'Error updating queue entry status'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  }, [
    priority,
    status,
    visitUuid,
    queueUuid,
    queueEntryUuid,
    patientUuid,
    priorities,
    statuses,
    t,
    closeModal,
    mutate,
  ]);

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('changePatientStatus', 'Change patient status?')} />
      <ModalBody>
        <Form onSubmit={changeQueueStatus}>
          <FormGroup legendText="">
            <RadioButtonGroup
              className={styles.radioButtonGroup}
              valueSelected={status}
              orientation="vertical"
              onChange={(event) => setStatus(event.toString())}
              name="radio-button-group">
              {isLoading ? (
                <InlineLoading description={t('loading', 'Loading...')} />
              ) : statuses?.length === 0 ? (
                <p>{t('noStatusAvailable', 'No Status Available')}</p>
              ) : (
                statuses.map(({ uuid, display, name }) => (
                  <RadioButton key={uuid} className={styles.radioButton} id={name} labelText={display} value={uuid} />
                ))
              )}
            </RadioButtonGroup>
          </FormGroup>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('priority', 'Priority')}</div>
            <ContentSwitcher
              size="sm"
              selectedIndex={1}
              onChange={(event) => {
                setPriority(event.name as any);
              }}>
              {priorities?.length > 0 ? (
                priorities.map(({ uuid, display }) => {
                  return <Switch name={uuid} text={display} value={uuid} />;
                })
              ) : (
                <Switch
                  name={t('noPriorityFound', 'No priority found')}
                  text={t('noPriorityFound', 'No priority found')}
                  value={null}
                />
              )}
            </ContentSwitcher>
          </section>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={changeQueueStatus}>{t('exitAndChangeStatus', 'Exit and change status')}</Button>
      </ModalFooter>
    </div>
  );
};

export default ChangeStatus;
