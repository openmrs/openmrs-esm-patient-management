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
import { updateQueueEntry, usePriority, useStatus } from './active-visits-table.resource';
import { useTranslation } from 'react-i18next';
import styles from './change-status-dialog.scss';
import { useSWRConfig } from 'swr';

interface ChangeStatusDialogProps {
  patientUuid: string;
  queueUuid: string;
  queueEntryUuid: string;
  visitUuid: string;
  closeModal: () => void;
}

const ChangeStatus: React.FC<ChangeStatusDialogProps> = ({
  patientUuid,
  queueUuid,
  queueEntryUuid,
  visitUuid,
  closeModal,
}) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState();
  const { priorities } = usePriority();
  const { statuses, isLoading } = useStatus();
  const { mutate } = useSWRConfig();

  const changeQueueStatus = useCallback(() => {
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
  }, [visitUuid, queueUuid, queueEntryUuid, patientUuid, priority, status, t, closeModal]);

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('changePatientStatus', 'Change patient status?')} />
      <ModalBody>
        <Form onSubmit={changeQueueStatus}>
          <FormGroup legendText="">
            <RadioButtonGroup
              className={styles.radioButtonGroup}
              defaultSelected="default-selected"
              orientation="vertical"
              onChange={(event) => setStatus(event.toString())}
              name="radio-button-group"
              valueSelected="default-selected">
              {isLoading ? (
                <InlineLoading description={t('loading', 'Loading...')} />
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
