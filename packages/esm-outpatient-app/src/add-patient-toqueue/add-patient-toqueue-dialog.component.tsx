import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ContentSwitcher,
  Form,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
} from '@carbon/react';
import { ConfigObject, showNotification, showToast, useConfig } from '@openmrs/esm-framework';
import {
  addQueueEntry,
  usePriority,
  useServices,
  useStatus,
  useVisitQueueEntries,
} from '../active-visits/active-visits-table.resource';
import styles from './add-patient-toqueue-dialog.scss';
import { ActiveVisit } from '../visits-missing-inqueue/visits-missing-inqueue.resource';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';

interface AddVisitToQueueDialogProps {
  visitDetails: ActiveVisit;
  closeModal: () => void;
}

const AddVisitToQueue: React.FC<AddVisitToQueueDialogProps> = ({ visitDetails, closeModal }) => {
  const { t } = useTranslation();

  const [priority, setPriority] = useState('');
  const visitUuid = visitDetails?.visitUuid;
  const [queueUuid, setQueueUuid] = useState('');
  const patientUuid = visitDetails?.patientUuid;
  const patientName = visitDetails?.name;
  const patientAge = visitDetails?.age;
  const patientSex = visitDetails?.gender;
  const { priorities } = usePriority();
  const { statuses, isLoading } = useStatus();
  const [selectedQueueLocation, setSelectedQueueLocation] = useState('');
  const { services } = useServices(selectedQueueLocation);
  const { queueLocations } = useQueueLocations();
  const [isMissingPriority, setIsMissingPriority] = useState(false);
  const [isMissingService, setIsMissingService] = useState(false);
  const config = useConfig() as ConfigObject;
  const { mutate } = useVisitQueueEntries('', selectedQueueLocation);

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
    const visitQueueNumberAttributeUuid = config.concepts.visitQueueNumberAttributeUuid;

    addQueueEntry(
      visitUuid,
      queueUuid,
      patientUuid,
      priority,
      status,
      sortWeight,
      new AbortController(),
      selectedQueueLocation,
      visitQueueNumberAttributeUuid,
    ).then(
      ({ status }) => {
        if (status === 201) {
          showToast({
            critical: true,
            title: t('addEntry', 'Add entry'),
            kind: 'success',
            description: t('queueEntryAddedSuccessfully', 'Queue Entry Added Successfully'),
          });
          closeModal();
          mutate();
        }
      },
      (error) => {
        showNotification({
          title: t('queueEntryAddFailed', 'Error adding queue entry status'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
      },
    );
  }, [
    queueUuid,
    priority,
    config.concepts.emergencyPriorityConceptUuid,
    config.concepts.defaultStatusConceptUuid,
    config.concepts.visitQueueNumberAttributeUuid,
    visitUuid,
    patientUuid,
    selectedQueueLocation,
    t,
    closeModal,
    mutate,
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
              {services?.length > 0 &&
                services.map((service) => (
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
                title={t('missingService', 'Please select a service')}
              />
            </section>
          )}

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
