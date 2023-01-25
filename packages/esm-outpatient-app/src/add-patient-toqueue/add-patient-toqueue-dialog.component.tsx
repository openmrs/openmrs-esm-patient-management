import React, { useCallback, useEffect, useState } from 'react';
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
  Select,
  SelectItem,
} from '@carbon/react';
import { showNotification, showToast, useLocations, useSession } from '@openmrs/esm-framework';
import { addQueueEntry, usePriority, useServices, useStatus } from '../active-visits/active-visits-table.resource';
import { useTranslation } from 'react-i18next';
import styles from './add-patient-toqueue-dialog.scss';
import { useSWRConfig } from 'swr';
import first from 'lodash-es/first';
import { ActiveVisit } from '../visits-missing-inqueue/visits-missing-inqueue.resource';

interface AddVisitToQueueDialogProps {
  visitDetails: ActiveVisit;
  closeModal: () => void;
}

const AddVisitToQueue: React.FC<AddVisitToQueueDialogProps> = ({ visitDetails, closeModal }) => {
  const { t } = useTranslation();

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const visitUuid = visitDetails?.visitUuid;
  const [queueUuid, setQueueUuid] = useState('');
  const patientUuid = visitDetails?.patientUuid;
  const patientName = visitDetails?.name;
  const patientAge = visitDetails?.age;
  const patientSex = visitDetails?.gender;
  const { priorities } = usePriority();
  const { statuses, isLoading } = useStatus();
  const { mutate } = useSWRConfig();
  const [userLocation, setUserLocation] = useState('');
  const session = useSession();
  const locations = useLocations();
  const { services } = useServices(userLocation);

  useEffect(() => {
    if (!userLocation && session?.sessionLocation !== null) {
      setUserLocation(session?.sessionLocation?.uuid);
    } else if (!userLocation && locations) {
      setUserLocation(first(locations)?.uuid);
    }
  }, [session, locations, userLocation]);

  const addVisitToQueue = useCallback(() => {
    if (priority === '') {
      setPriority([...priorities].shift().uuid);
    }
    if (status === '') {
      statuses.find((data) => data.display.toLowerCase() === 'waiting').uuid;
    }
    addQueueEntry(visitUuid, queueUuid, patientUuid, priority, status, new AbortController()).then(
      ({ status }) => {
        if (status === 201) {
          showToast({
            critical: true,
            title: t('addEntry', 'Add entry'),
            kind: 'success',
            description: t('queueEntryAddedSuccessfully', 'Queue Entry Added Successfully'),
          });
          closeModal();
          mutate(`/ws/rest/v1/visit-queue-entry?v=full`);
          mutate(`/ws/rest/v1/visit?includeInactive=false`);
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
  }, [priority, status, visitUuid, queueUuid, patientUuid, priorities, statuses, t, closeModal, mutate]);

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
          <div className={styles.sectionTitle}>{t('queueStatus', 'Queue status')}</div>
          <FormGroup legendText="">
            <RadioButtonGroup
              className={styles.radioButtonGroup}
              valueSelected={status}
              orientation="vertical"
              onChange={(event) => setStatus(event.toString())}
              name="radio-button-group">
              {isLoading ? (
                <InlineLoading role="progressbar" description={t('loading', 'Loading...')} />
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
        <Button onClick={addVisitToQueue}>{t('save', 'Save')}</Button>
      </ModalFooter>
    </div>
  );
};

export default AddVisitToQueue;
