import React, { useMemo } from 'react';
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
  InlineLoading,
  Tile,
  TextInput,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { navigate, showSnackbar, useConfig } from '@openmrs/esm-framework';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import styles from './send-back-patient-toqueue.scss';
import { useQueues } from '../hooks/useQueues';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ConfigObject } from '../config-schema';
import { useMutateQueueEntries } from '../hooks/useQueueEntries';
import { useQueueEntry } from './send-back-patient-toqueue.resource';
import { updateQueueEntry } from '../active-visits/active-visits-table.resource';

interface SendBackPatientProps {
  patientUuid: string;
  closeModal: () => void;
}

const SendBackPatientToQueue: React.FC<SendBackPatientProps> = ({ closeModal, patientUuid }) => {
  const { t } = useTranslation();
  const { concepts } = useConfig<ConfigObject>();
  const { data, error, isLoading } = useQueueEntry(patientUuid);
  const allowedPriorities = data?.queue?.allowedPriorities ?? [];
  const allowedStatuses = data?.queue?.allowedStatuses ?? [];
  const uppercaseText = (text: string) => text.toUpperCase();

  const schema = useMemo(
    () =>
      z.object({
        location: z.string({ required_error: t('queueLocationRequired', 'Queue location is required') }),
        service: z.string({ required_error: t('serviceIsRequired', 'Service is required') }),
        status: z.string({ required_error: t('statusIsRequired', 'Status is required') }),
        priority: z.string({ required_error: t('priorityIsRequired', 'Priority is required') }),
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
    resolver: zodResolver(schema),
  });

  const queueServiceLocation = data?.locationWaitingFor?.display ?? '';
  const { queues } = useQueues(queueServiceLocation);
  const { queueLocations } = useQueueLocations();
  const { mutateQueueEntries } = useMutateQueueEntries();

  const onSubmit = async (updateQueueData: ChangeStatusForm) => {
    const { status, service } = updateQueueData;
    const defaultPriority = concepts.defaultPriorityConceptUuid;
    const queuePriority = updateQueueData.priority === '' ? defaultPriority : updateQueueData.priority;
    const emergencyPriorityConceptUuid = concepts.emergencyPriorityConceptUuid;
    const sortWeight = updateQueueData.priority === emergencyPriorityConceptUuid ? 1.0 : 0.0;
    const endDate = new Date();

    try {
      const response = await updateQueueEntry(
        data?.visit.uuid,
        data?.queue.uuid,
        service,
        data?.uuid,
        patientUuid,
        queuePriority,
        status,
        endDate,
        sortWeight,
      );

      if (response.status === 201) {
        showSnackbar({
          isLowContrast: true,
          title: t('sendPatientBack', 'Back to queue'),
          kind: 'success',
          subtitle: t('sendBackPatientBackSuccess', 'Patient sent back to queue Successfully'),
        });
        closeModal();
        mutateQueueEntries();
        navigate({ to: `${window.spaBase}/home/service-queues` });
      }
    } catch (error) {
      showSnackbar({
        title: t('queueEntryStatusUpdateFailed', 'Error updating queue entry status'),
        kind: 'error',
        subtitle: error?.message,
      });
    }
  };

  const onError = (errors: any) => console.error(errors);

  if (!data) {
    return (
      <Tile>
        <ModalHeader closeModal={closeModal} title={t('sendPatientToAQueue', 'Add to a queue')} />
        <ModalBody>
          <div className={styles.modalBody}>
            <h5>{t('patientNotInQueue', 'The patient is not in the queue')}</h5>
          </div>
        </ModalBody>
      </Tile>
    );
  }

  return (
    <div>
      <Form onSubmit={handleSubmit(onSubmit, onError)}>
        <ModalHeader closeModal={closeModal} title={t('sendPatientToAQueue', 'Add to a queue')} />
        <ModalBody>
          <div className={styles.modalBody}>
            <h5>
              {uppercaseText(data.patient.person.display)} &nbsp; · &nbsp;{data.patient.person.gender} &nbsp; · &nbsp;
              {data.patient.person.age}&nbsp;
              {t('years', 'Years')}
            </h5>
          </div>
          <TextInput
            readOnly
            value={data.queueComingFrom?.display}
            labelText={t('queueFrom', "Patient's previous queue")}
          />
          <section>
            <Controller
              name="location"
              control={control}
              defaultValue={data?.queueComingFrom?.location?.uuid}
              render={({ field: { onChange, value } }) => (
                <Select
                  labelText={t('selectQueueLocation', 'Select a queue location')}
                  id="location"
                  invalid={!!errors.location}
                  invalidText={errors.location?.message}
                  value={value}
                  onChange={(event) => onChange(event.target.value)}>
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
              defaultValue={data?.queueComingFrom?.uuid}
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
                defaultValue={data?.queue?.allowedStatuses[2].uuid}
                render={({ field: { value, onChange } }) => (
                  <RadioButtonGroup
                    className={styles.radioButtonWrapper}
                    name="status"
                    invalid={!!errors.status}
                    invalidText={errors.status?.message}
                    defaultSelected={value}
                    onChange={(uuid) => onChange(uuid)}>
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
              defaultValue={data?.queue.allowedPriorities[2]?.uuid}
              render={({ field: { onChange } }) => (
                <>
                  <ContentSwitcher
                    size="sm"
                    selectedIndex={allowedPriorities.findIndex((p) => p.uuid === getValues().priority)}
                    onChange={(event) => onChange(event.name as any)}>
                    {allowedPriorities?.length > 0 ? (
                      allowedPriorities.map(({ uuid, display }) => (
                        <Switch name={uuid} text={display} key={uuid} value={uuid} />
                      ))
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
                t('returnPatientToQueue', 'Return patient to queue')
              )}
            </>
          </Button>
        </ModalFooter>
      </Form>
    </div>
  );
};

export default SendBackPatientToQueue;
