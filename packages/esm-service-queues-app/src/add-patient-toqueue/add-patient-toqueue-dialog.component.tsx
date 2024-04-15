import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Form,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  RadioButtonGroup,
  RadioButton,
} from '@carbon/react';
import { type ConfigObject, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { addQueueEntry } from '../active-visits/active-visits-table.resource';
import styles from './add-patient-toqueue-dialog.scss';
import { type ActiveVisit, useMissingQueueEntries } from '../visits-missing-inqueue/visits-missing-inqueue.resource';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import { useQueues } from '../helpers/useQueues';
import { useMutateQueueEntries } from '../hooks/useMutateQueueEntries';

interface AddVisitToQueueDialogProps {
  visitDetails: ActiveVisit;
  closeModal: () => void;
}

const AddVisitToQueue: React.FC<AddVisitToQueueDialogProps> = ({ visitDetails, closeModal }) => {
  const { t } = useTranslation();

  const visitUuid = visitDetails?.visitUuid;
  const [queueUuid, setQueueUuid] = useState('');
  const patientUuid = visitDetails?.patientUuid;
  const patientName = visitDetails?.name;
  const patientAge = visitDetails?.age;
  const patientSex = visitDetails?.gender;
  const [selectedQueueLocation, setSelectedQueueLocation] = useState('');
  const { queues } = useQueues(selectedQueueLocation);
  const { queueLocations } = useQueueLocations();
  const [isMissingPriority, setIsMissingPriority] = useState(false);
  const [isMissingService, setIsMissingService] = useState(false);
  const config = useConfig() as ConfigObject;
  const { mutateQueueEntries } = useMutateQueueEntries();
  const [priority, setPriority] = useState(config.concepts.defaultPriorityConceptUuid);
  const priorities = queues.find((q) => q.uuid === queueUuid)?.allowedPriorities ?? [];

  const addVisitToQueue = useCallback(() => {
    if (!queueUuid) {
      setIsMissingService(true);
      return;
    }
    setIsMissingService(false);

    if (!priority) {
      setIsMissingPriority(true);
      return;
    }
    setIsMissingPriority(false);
    const emergencyPriorityConceptUuid = config.concepts.emergencyPriorityConceptUuid;
    const sortWeight = priority === emergencyPriorityConceptUuid ? 1.0 : 0.0;
    const status = config.concepts.defaultStatusConceptUuid;
    const visitQueueNumberAttributeUuid = config.visitQueueNumberAttributeUuid;

    addQueueEntry(
      visitUuid,
      queueUuid,
      patientUuid,
      priority,
      status,
      sortWeight,
      selectedQueueLocation,
      visitQueueNumberAttributeUuid,
    ).then(
      ({ status }) => {
        if (status === 201) {
          showSnackbar({
            isLowContrast: true,
            title: t('addEntry', 'Add entry'),
            kind: 'success',
            subtitle: t('queueEntryAddedSuccessfully', 'Queue Entry Added Successfully'),
          });
          closeModal();
          mutateQueueEntries();
        }
      },
      (error) => {
        showSnackbar({
          title: t('queueEntryAddFailed', 'Error adding queue entry status'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      },
    );
  }, [
    queueUuid,
    priority,
    config.concepts.emergencyPriorityConceptUuid,
    config.concepts.defaultStatusConceptUuid,
    config.visitQueueNumberAttributeUuid,
    visitUuid,
    patientUuid,
    selectedQueueLocation,
    t,
    closeModal,
    mutateQueueEntries,
  ]);

  return (
    <div>
      <ModalHeader closeModal={closeModal} title={t('addVisitToQueue', 'Add Visit To Queue?')} />
      <ModalBody>
        <Form onSubmit={addVisitToQueue}>
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
              onChange={(event) => setSelectedQueueLocation(event.target.value)}>
              {!selectedQueueLocation ? (
                <SelectItem text={t('selectQueueLocation', 'Select a queue location')} value="" />
              ) : null}
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
              value={queueUuid}
              onChange={(event) => setQueueUuid(event.target.value)}>
              {!queueUuid ? <SelectItem text={t('chooseService', 'Select a service')} value="" /> : null}
              {queues?.length > 0 &&
                queues.map((service) => (
                  <SelectItem key={service.uuid} text={service.display} value={service.uuid}>
                    {service.display}
                  </SelectItem>
                ))}
            </Select>
          </section>
          {isMissingService && (
            <section>
              <InlineNotification
                style={{ margin: '0', minWidth: '100%' }}
                kind="error"
                lowContrast={true}
                title={t('pleaseSelectService', 'Please select a service')}
              />
            </section>
          )}

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('queueStatus', 'Queue status')}</div>
            {!priorities?.length ? (
              <InlineNotification
                className={styles.inlineNotification}
                kind={'error'}
                lowContrast
                subtitle={t('configurePriorities', 'Please configure priorities to continue.')}
                title={t('noPriorityFound', 'No priority found')}
              />
            ) : (
              <RadioButtonGroup
                className={styles.radioButtonWrapper}
                name="priority"
                defaultSelected={priority}
                onChange={(uuid) => {
                  setPriority(uuid);
                }}>
                {priorities?.length > 0 &&
                  priorities.map(({ uuid, display }) => <RadioButton key={uuid} labelText={display} value={uuid} />)}
              </RadioButtonGroup>
            )}
          </section>
          {isMissingPriority && (
            <section>
              <InlineNotification
                style={{ margin: '0', minWidth: '100%' }}
                kind="error"
                lowContrast={true}
                title={t('missingPriority', 'Please select a priority')}
              />
            </section>
          )}
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={addVisitToQueue}>{t('save', 'Save')}</Button>
      </ModalFooter>
    </div>
  );
};

export default AddVisitToQueue;
