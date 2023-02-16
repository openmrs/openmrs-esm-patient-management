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
} from '@carbon/react';
import {
  ConfigObject,
  showNotification,
  showToast,
  toDateObjectStrict,
  toOmrsIsoString,
  useConfig,
} from '@openmrs/esm-framework';
import { updateQueueEntry, usePriority, useServices, useStatus } from './active-visits-table.resource';
import { useTranslation } from 'react-i18next';
import styles from './change-status-dialog.scss';
import { useSWRConfig } from 'swr';
import { MappedQueueEntry } from '../types';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';

interface ChangeStatusDialogProps {
  queueEntry: MappedQueueEntry;
  closeModal: () => void;
}

const ChangeStatus: React.FC<ChangeStatusDialogProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();

  const [status, setStatus] = useState(queueEntry?.statusUuid);
  const [priority, setPriority] = useState(queueEntry?.priorityUuid);
  const [visitUuid, setVisitUuid] = useState(queueEntry?.visitUuid);
  const [previousQueueUuid, setPreviousQueueUuid] = useState(queueEntry?.queueUuid);
  const [newQueueUuid, setNewQueueUuid] = useState('');
  const [queueEntryUuid, setQueueEntryUuid] = useState(queueEntry?.queueEntryUuid);
  const [patientUuid, setPatientUuid] = useState(queueEntry?.patientUuid);
  const [patientName, setPatientName] = useState(queueEntry?.name);
  const [patientAge, setPatientAge] = useState(queueEntry?.patientAge);
  const [patientSex, setPatientSex] = useState(queueEntry?.patientSex);
  const { priorities } = usePriority();
  const { statuses, isLoading } = useStatus();
  const { mutate } = useSWRConfig();
  const config = useConfig() as ConfigObject;
  const [selectedQueueLocation, setSelectedQueueLocation] = useState(queueEntry?.queueLocation);
  const { services } = useServices(selectedQueueLocation);
  const { queueLocations } = useQueueLocations();
  const [editLocation, setEditLocation] = useState(false);

  const changeQueueStatus = useCallback(() => {
    const defaultStatus = config.concepts.defaultStatusConceptUuid;
    const defaultPriority = config.concepts.defaultPriorityConceptUuid;
    setEditLocation(false);
    if (priority === '') {
      setPriority(defaultPriority);
    }
    if (status === '') {
      setStatus(defaultStatus);
    }
    const emergencyPriorityConceptUuid = config.concepts.emergencyPriorityConceptUuid;
    const sortWeight = priority === emergencyPriorityConceptUuid ? 1.0 : 0.0;
    const endDate = toDateObjectStrict(toOmrsIsoString(new Date()));
    updateQueueEntry(
      visitUuid,
      previousQueueUuid,
      newQueueUuid,
      queueEntryUuid,
      patientUuid,
      priority,
      status,
      endDate,
      sortWeight,
      new AbortController(),
    ).then(
      ({ status }) => {
        if (status === 201) {
          showToast({
            critical: true,
            title: t('updateEntry', 'Update entry'),
            kind: 'success',
            description: t('queueEntryUpdateSuccessfully', 'Queue Entry Updated Successfully'),
          });
          closeModal();
          mutate(`/ws/rest/v1/visit-queue-entry?location=${selectedQueueLocation}&v=full`);
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
    previousQueueUuid,
    newQueueUuid,
    queueEntryUuid,
    patientUuid,
    priorities,
    statuses,
    t,
    closeModal,
    mutate,
  ]);

  if (Object.keys(queueEntry)?.length === 0) {
    return <ModalHeader closeModal={closeModal} title={t('patientNotInQueue', 'The patient is not in the queue')} />;
  }

  if (Object.keys(queueEntry)?.length > 0) {
    return (
      <div>
        <ModalHeader
          closeModal={closeModal}
          title={t('movePatientToNextService', 'Move patient to the next service?')}
        />
        <ModalBody>
          <Form onSubmit={changeQueueStatus}>
            <div className={styles.modalBody}>
              <h5>
                {patientName} &nbsp; · &nbsp;{patientSex} &nbsp; · &nbsp;{patientAge}&nbsp;{t('years', 'Years')}
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
                {!previousQueueUuid ? <SelectItem text={t('selectService', 'Select a service')} value="" /> : null}
                {services?.length > 0 &&
                  services.map((service) => (
                    <SelectItem key={service.uuid} text={service.display} value={service.uuid}>
                      {service.display}
                    </SelectItem>
                  ))}
              </Select>
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
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button kind="secondary" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={changeQueueStatus}>{t('moveToNextService', 'Move to next service')}</Button>
        </ModalFooter>
      </div>
    );
  }
};

export default ChangeStatus;
