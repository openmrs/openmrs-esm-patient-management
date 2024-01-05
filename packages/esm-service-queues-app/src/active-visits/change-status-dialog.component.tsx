import React, { useCallback, useState } from 'react';
import {
  Button,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Form,
  ContentSwitcher,
  Switch,
  Select,
  SelectItem,
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type ConfigObject, navigate, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { type MappedQueueEntry } from '../types';
import {
  updateQueueEntry,
  usePriority,
  useServices,
  useStatus,
  useVisitQueueEntries,
} from './active-visits-table.resource';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import styles from './change-status-dialog.scss';

interface ChangeStatusDialogProps {
  queueEntry: MappedQueueEntry;
  closeModal: () => void;
}

const ChangeStatus: React.FC<ChangeStatusDialogProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();

  const [priority, setPriority] = useState(queueEntry?.priorityUuid);
  const [newQueueUuid, setNewQueueUuid] = useState('');
  const { priorities } = usePriority();
  const config = useConfig() as ConfigObject;
  const [selectedQueueLocation, setSelectedQueueLocation] = useState(queueEntry?.queueLocation);
  const { services } = useServices(selectedQueueLocation);
  const { queueLocations } = useQueueLocations();
  const [editLocation, setEditLocation] = useState(false);
  const { mutate } = useVisitQueueEntries('', selectedQueueLocation);
  const { statuses } = useStatus();
  const [queueStatus, setQueueStatus] = useState(queueEntry?.statusUuid);

  const changeQueueStatus = useCallback(
    (event) => {
      event.preventDefault();
      const defaultPriority = config.concepts.defaultPriorityConceptUuid;
      setEditLocation(false);
      const queuePriority = priority === '' ? defaultPriority : priority;
      const emergencyPriorityConceptUuid = config.concepts.emergencyPriorityConceptUuid;
      const sortWeight = priority === emergencyPriorityConceptUuid ? 1.0 : 0.0;
      const endDate = new Date();
      updateQueueEntry(
        queueEntry?.visitUuid,
        queueEntry?.queueUuid,
        event?.target['service']?.value,
        queueEntry?.queueEntryUuid,
        queueEntry?.patientUuid,
        queuePriority,
        queueStatus,
        endDate,
        sortWeight,
      ).then(
        ({ status }) => {
          if (status === 201) {
            showSnackbar({
              isLowContrast: true,
              title: t('updateEntry', 'Update entry'),
              kind: 'success',
              subtitle: t('queueEntryUpdateSuccessfully', 'Queue Entry Updated Successfully'),
            });
            closeModal();
            mutate();
            navigate({ to: `${window.spaBase}/home/service-queues` });
          }
        },
        (error) => {
          showSnackbar({
            title: t('queueEntryStatusUpdateFailed', 'Error updating queue entry status'),
            kind: 'error',
            subtitle: error?.message,
          });
        },
      );
    },
    [
      config.concepts.defaultPriorityConceptUuid,
      config.concepts.emergencyPriorityConceptUuid,
      priority,
      queueEntry?.visitUuid,
      queueEntry?.queueUuid,
      queueEntry?.queueEntryUuid,
      queueEntry?.patientUuid,
      queueStatus,
      t,
      closeModal,
      mutate,
    ],
  );

  if (Object.keys(queueEntry)?.length === 0) {
    return <ModalHeader closeModal={closeModal} title={t('patientNotInQueue', 'The patient is not in the queue')} />;
  }

  if (Object.keys(queueEntry)?.length > 0) {
    return (
      <div>
        <Form onSubmit={changeQueueStatus}>
          <ModalHeader
            closeModal={closeModal}
            title={t('movePatientToNextService', 'Move patient to the next service?')}
          />
          <ModalBody>
            <div className={styles.modalBody}>
              <h5>
                {queueEntry.name} &nbsp; · &nbsp;{queueEntry.patientSex} &nbsp; · &nbsp;{queueEntry.patientAge}&nbsp;
                {t('years', 'Years')}
              </h5>
            </div>
            <section>
              <Select
                labelText={t('selectQueueLocation', 'Select a queue location')}
                id="location"
                invalidText="Required"
                value={selectedQueueLocation}
                onChange={(event) => {
                  setSelectedQueueLocation(event.target.value);
                  setEditLocation(true);
                }}>
                {!selectedQueueLocation ? <SelectItem text={t('selectOption', 'Select an option')} value="" /> : null}
                {queueLocations?.length > 0 &&
                  queueLocations.map((location) => (
                    <SelectItem key={location.id} text={location.name} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
              </Select>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}>{t('queueService', 'Queue service')}</div>
              <Select
                labelText={t('selectService', 'Select a service')}
                id="service"
                invalidText="Required"
                value={newQueueUuid}
                onChange={(event) => setNewQueueUuid(event.target.value)}>
                {!newQueueUuid && editLocation === true ? (
                  <SelectItem text={t('selectService', 'Select a service')} value="" />
                ) : null}
                {!queueEntry.queueUuid ? <SelectItem text={t('selectService', 'Select a service')} value="" /> : null}
                {services?.length > 0 &&
                  services.map((service) => (
                    <SelectItem key={service.uuid} text={service.display} value={service.uuid}>
                      {service.display}
                    </SelectItem>
                  ))}
              </Select>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}>{t('queueStatus', 'Queue status')}</div>
              {!statuses?.length ? (
                <InlineNotification
                  className={styles.inlineNotification}
                  kind={'error'}
                  lowContrast
                  subtitle={t('configureStatus', 'Please configure status to continue.')}
                  title={t('noStatusConfigured', 'No status configured')}
                />
              ) : (
                <RadioButtonGroup
                  className={styles.radioButtonWrapper}
                  name="status"
                  defaultSelected={queueStatus}
                  onChange={(uuid) => {
                    setQueueStatus(uuid);
                  }}>
                  {statuses?.length > 0 &&
                    statuses.map(({ uuid, display }) => <RadioButton key={uuid} labelText={display} value={uuid} />)}
                </RadioButtonGroup>
              )}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionTitle}>{t('queuePriority', 'Queue priority')}</div>
              <ContentSwitcher
                size="sm"
                selectedIndex={1}
                onChange={(event) => {
                  setPriority(event.name as any);
                }}>
                {priorities?.length > 0 ? (
                  priorities.map(({ uuid, display }) => {
                    return <Switch name={uuid} text={display} key={uuid} value={uuid} />;
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
          </ModalBody>
          <ModalFooter>
            <Button kind="secondary" onClick={closeModal}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button type="submit">{t('moveToNextService', 'Move to next service')}</Button>
          </ModalFooter>
        </Form>
      </div>
    );
  }
};

export default ChangeStatus;
