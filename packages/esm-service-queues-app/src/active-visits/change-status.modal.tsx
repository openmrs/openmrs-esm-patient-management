import React, { useMemo } from 'react';
import {
  Button,
  ContentSwitcher,
  Form,
  InlineLoading,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  Stack,
  Switch,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { navigate, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { type Queue } from '../types';
import { type ConfigObject } from '../config-schema';
import { useQueues } from '../hooks/useQueues';
import { updateQueueEntry } from './active-visits-table.resource';
import { useMutateQueueEntries } from '../hooks/useQueueEntries';
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
import styles from './change-status.scss';

interface ChangeStatusModalProps {
  queueEntry: MappedVisitQueueEntry;
  closeModal: () => void;
}
//it's copied from openmrs-esm-patient-chart/packages/esm-patient-chart-app/src/visit/queue-entry/queue.resource.tsx

type QueuePriority = 'Emergency' | 'Not Urgent' | 'Priority' | 'Urgent';
type MappedQueuePriority = Omit<QueuePriority, 'Urgent'>;
type QueueStatus = 'Finished Service' | 'In Service' | 'Waiting';

interface MappedVisitQueueEntry {
  id: string;
  name: string;
  patientUuid: string;
  priority: MappedQueuePriority;
  priorityUuid: string;
  patientAge: string;
  patientSex: string;
  service: string;
  status: QueueStatus;
  statusUuid: string;
  visitUuid: string;
  visitType: string;
  queue: Queue;
  queueEntryUuid: string;
  queueLocation: string;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({ queueEntry, closeModal }) => {
  const { t } = useTranslation();
  const { concepts } = useConfig<ConfigObject>();
  const { allowedPriorities, allowedStatuses } = queueEntry.queue ?? {};
  const currentPriority = queueEntry.priorityUuid;

  const schema = useMemo(
    () =>
      z.object({
        location: z.string({ required_error: t('queueLocationRequired', 'Queue location is required') }),
        priority: z.string({ required_error: t('priorityIsRequired', 'Priority is required') }),
        service: z.string({ required_error: t('serviceIsRequired', 'Service is required') }),
        status: z.string({ required_error: t('statusIsRequired', 'Status is required') }),
      }),
    [t],
  );

  type ChangeStatusForm = z.infer<typeof schema>;

  const {
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
    getValues,
  } = useForm<ChangeStatusForm>({
    defaultValues: { priority: currentPriority ?? concepts.defaultPriorityConceptUuid },
    resolver: zodResolver(schema),
  });

  const { queues } = useQueues(queueEntry?.queueLocation);
  const { queueLocations } = useQueueLocations();
  const { mutateQueueEntries } = useMutateQueueEntries();

  const onSubmit = (data: ChangeStatusForm) => {
    const { priority, status, service } = data;
    const defaultPriority = concepts.defaultPriorityConceptUuid;
    const queuePriority = priority === '' ? defaultPriority : priority;
    const emergencyPriorityConceptUuid = concepts.emergencyPriorityConceptUuid;
    const sortWeight = priority === emergencyPriorityConceptUuid ? 1.0 : 0.0;
    const endDate = new Date();
    updateQueueEntry(
      queueEntry?.visitUuid,
      queueEntry?.queue?.uuid,
      service,
      queueEntry?.queueEntryUuid,
      queueEntry?.patientUuid,
      queuePriority,
      status,
      endDate,
      sortWeight,
    ).then(
      () => {
        showSnackbar({
          isLowContrast: true,
          title: t('updateEntry', 'Update entry'),
          kind: 'success',
          subtitle: t('queueEntryUpdateSuccessfully', 'Queue Entry Updated Successfully'),
        });
        closeModal();
        mutateQueueEntries();
        navigate({ to: `${window.spaBase}/home/service-queues` });
      },
      (error) => {
        showSnackbar({
          title: t('queueEntryStatusUpdateFailed', 'Error updating queue entry status'),
          kind: 'error',
          subtitle: error?.message,
        });
      },
    );
  };
  const onError = (errors) => console.error(errors);

  if (Object.keys(queueEntry)?.length === 0) {
    return <ModalHeader closeModal={closeModal} title={t('patientNotInQueue', 'The patient is not in the queue')} />;
  }

  if (Object.keys(queueEntry)?.length > 0) {
    return (
      <div>
        <Form onSubmit={handleSubmit(onSubmit, onError)}>
          <ModalHeader
            closeModal={closeModal}
            title={t('movePatientToNextService', 'Move patient to the next service?')}
          />
          <ModalBody>
            <div className={styles.modalBody}>
              <h5>
                {t('patientInfo', '{{name}}{{sexInfo}}{{ageInfo}}', {
                  name: queueEntry.name,
                  sexInfo: queueEntry.patientSex ? ` · ${queueEntry.patientSex} · ` : '',
                  ageInfo: queueEntry.patientAge ? `${queueEntry.patientAge} ${t('years', 'Years')}` : '',
                })}
              </h5>
            </div>
            <Stack gap={4}>
              <section>
                <div className={styles.sectionTitle}>{t('queueLocation', 'Queue location')}</div>
                <Controller
                  name="location"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      labelText={t('selectQueueLocation', 'Select a queue location')}
                      id="location"
                      invalid={!!errors.location}
                      invalidText={errors.location?.message}
                      value={value}
                      onChange={(event) => {
                        onChange(event.target.value);
                      }}>
                      {!getValues()?.location && (
                        <SelectItem text={t('selectQueueLocation', 'Select a queue location')} value="" />
                      )}
                      {queueLocations?.length > 0 &&
                        queueLocations.map((location) => (
                          <SelectItem key={location.id} text={location.name} value={location.id}>
                            {location.name}
                          </SelectItem>
                        ))}
                    </Select>
                  )}
                />
              </section>
              <section className={styles.section}>
                <div className={styles.sectionTitle}>{t('queueService', 'Queue service')}</div>
                <Controller
                  name="service"
                  control={control}
                  render={({ field: { onChange, value } }) => (
                    <Select
                      labelText={t('selectService', 'Select a service')}
                      id="service"
                      invalid={!!errors.service}
                      invalidText={errors.service?.message}
                      value={value}
                      onChange={(event) => onChange(event.target.value)}>
                      {!getValues()?.service && <SelectItem text={t('selectService', 'Select a service')} value="" />}
                      {queues?.length > 0 &&
                        queues.map((service) => (
                          <SelectItem key={service.uuid} text={service.display} value={service.uuid}>
                            {service.display}
                          </SelectItem>
                        ))}
                    </Select>
                  )}
                />
              </section>
              <section className={styles.section}>
                <div className={styles.sectionTitle}>{t('queueStatus', 'Queue status')}</div>
                {!allowedStatuses?.length ? (
                  <InlineNotification
                    className={styles.inlineNotification}
                    kind={'error'}
                    lowContrast
                    subtitle={t('configureStatus', 'Please configure status to continue.')}
                    title={t('noStatusConfigured', 'No status configured')}
                  />
                ) : (
                  <Controller
                    name="status"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                      <RadioButtonGroup
                        id="status"
                        name="status"
                        invalid={!!errors.status}
                        invalidText={errors.status?.message}
                        defaultSelected={value}
                        onChange={(uuid) => {
                          onChange(uuid);
                        }}>
                        {allowedStatuses?.length > 0 &&
                          allowedStatuses.map(({ uuid, display }) => (
                            <RadioButton key={uuid} labelText={display} value={uuid} />
                          ))}
                      </RadioButtonGroup>
                    )}
                  />
                )}
              </section>
              <section className={styles.section}>
                <div className={styles.sectionTitle}>{t('queuePriority', 'Queue priority')}</div>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field: { onChange } }) => (
                    <>
                      <ContentSwitcher
                        size="sm"
                        selectedIndex={allowedPriorities?.findIndex((priority) => priority.uuid === currentPriority)}
                        onChange={(event) => {
                          onChange(event.name as any);
                        }}>
                        {allowedPriorities?.length > 0 ? (
                          allowedPriorities.map(({ uuid, display }) => {
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
                      {errors.priority && <div className={styles.error}>{errors.priority.message}</div>}
                    </>
                  )}
                />
              </section>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button kind="secondary" onClick={closeModal}>
              {t('cancel', 'Cancel')}
            </Button>
            <Button disabled={isSubmitting} type="submit">
              <>
                {isSubmitting ? (
                  <div className={styles.inline}>
                    <InlineLoading
                      status="active"
                      iconDescription={t('submitting', 'Submitting')}
                      description={t('submitting', 'Submitting')}
                    />
                  </div>
                ) : (
                  t('moveToNextService', 'Move to next service')
                )}
              </>
            </Button>
          </ModalFooter>
        </Form>
      </div>
    );
  }
};

export default ChangeStatusModal;
