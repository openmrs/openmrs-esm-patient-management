import React, { useCallback, useState } from 'react';
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  FormGroup,
  RadioButton,
  RadioButtonGroup,
} from 'carbon-components-react';
import { showNotification, showToast, useVisit, openmrsFetch } from '@openmrs/esm-framework';
import { useServices } from './active-visits-table.resource';
import { useTranslation } from 'react-i18next';
import styles from './change-status-dialog.scss';

interface ChangeStatusDialogProps {
  patientUuid: string;
  queueUuid: string;
  queueEntryUuid: string;
  closeModal: () => void;
}

const ChangeStatus: React.FC<ChangeStatusDialogProps> = ({ patientUuid, queueUuid, queueEntryUuid, closeModal }) => {
  const { t } = useTranslation();
  const { currentVisit, mutate } = useVisit(patientUuid);
  const [status, setStatus] = useState('');
  const { services } = useServices();

  const changeQueuePriority = useCallback(() => {
    const payload = {
      status: { uuid: status },
      endedAt: new Date(),
    };

    openmrsFetch(`/ws/rest/v1/queue/${queueUuid}/entry/${queueEntryUuid}`, {
      headers: {
        'Content-type': 'application/json',
      },
      method: 'POST',
      body: payload,
    }).then(
      () => {
        mutate();
        showToast({
          title: t('updateEntry', 'Update entry'),
          kind: 'success',
          description: t('queueEntryUpdateSuccessfully', 'Queue Entry Updated Successfully'),
        });
        closeModal();
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
  }, []);

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('changePatientStatus', 'Change patient status?')} />
      <ModalBody>
        <Form onSubmit={changeQueuePriority}>
          <FormGroup legendText="">
            <RadioButtonGroup
              className={styles.radioButtonGroup}
              defaultSelected="default-selected"
              orientation="vertical"
              onChange={(event) => setStatus(event.toString())}
              name="radio-button-group"
              valueSelected="default-selected">
              {services.map(({ uuid, display, name }) => (
                <RadioButton key={uuid} className={styles.radioButton} id={name} labelText={display} value={uuid} />
              ))}
            </RadioButtonGroup>
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={changeQueuePriority}>{t('exitAndChangeStatus', 'Exit and change status')}</Button>
      </ModalFooter>
    </div>
  );
};

export default ChangeStatus;
