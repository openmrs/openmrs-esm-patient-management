import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Column,
  Form,
  Layer,
  Stack,
  TextInput,
  Select,
  SelectItem,
  ButtonSet,
  Button,
  InlineNotification,
} from '@carbon/react';
import { mutate } from 'swr';
import { type DefaultWorkspaceProps, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { saveQueue, useServiceConcepts } from './queue-service.resource';
import { useQueueLocations } from '../patient-search/hooks/useQueueLocations';
import styles from './queue-service-form.scss';

const queueServiceSchema = z.object({
  queueName: z.string().min(1, { message: 'Queue name is required' }),
  queueConcept: z.string().min(1, { message: 'Service type is required' }),
  userLocation: z.string().min(1, { message: 'Location is required' }),
});

type QueueServiceFormData = z.infer<typeof queueServiceSchema>;

const QueueServiceForm: React.FC<DefaultWorkspaceProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const { queueConcepts } = useServiceConcepts();
  const { queueLocations } = useQueueLocations();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<QueueServiceFormData>({
    resolver: zodResolver(queueServiceSchema),
    defaultValues: {
      queueName: '',
      queueConcept: '',
      userLocation: '',
    },
  });

  const createQueue = (data: QueueServiceFormData) => {
    saveQueue(data.queueName, data.queueConcept, data.queueName, data.userLocation).then(
      ({ status }) => {
        if (status === 201) {
          showSnackbar({
            title: t('addQueue', 'Add queue'),
            kind: 'success',
            subtitle: t('queueAddedSuccessfully', 'Queue added successfully'),
          });
          closeWorkspace();
          mutate(`${restBaseUrl}/queue?${data.userLocation}`);
          mutate(`${restBaseUrl}/queue?location=${data.userLocation}`);
        }
      },
      (error) => {
        showSnackbar({
          title: t('errorAddingQueue', 'Error adding queue'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      },
    );
  };

  return (
    <Form onSubmit={handleSubmit(createQueue)} className={styles.form}>
      <Stack gap={4} className={styles.grid}>
        <Column>
          <Layer className={styles.input}>
            <Controller
              name="queueName"
              control={control}
              render={({ field }) => (
                <TextInput
                  {...field}
                  id="queueName"
                  invalidText={errors.queueName?.message}
                  invalid={!!errors.queueName}
                  labelText={t('queueName', 'Queue name')}
                />
              )}
            />
            {errors.queueName && (
              <section>
                <InlineNotification
                  style={{ margin: '0', minWidth: '100%' }}
                  kind="error"
                  lowContrast={true}
                  title={t('missingQueueName', 'Missing queue name')}
                  subtitle={errors.queueName.message}
                />
              </section>
            )}
          </Layer>
        </Column>

        <Column>
          <Layer className={styles.input}>
            <Controller
              name="queueConcept"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelText={t('selectServiceType', 'Select a service type')}
                  id="queueConcept"
                  invalidText={errors.queueConcept?.message}
                  invalid={!!errors.queueConcept}>
                  {!field.value && <SelectItem text={t('selectServiceType', 'Select a service type')} />}
                  {queueConcepts.length === 0 && (
                    <SelectItem text={t('noServicesAvailable', 'No services available')} />
                  )}
                  {queueConcepts?.length > 0 &&
                    queueConcepts.map((concept) => (
                      <SelectItem key={concept.uuid} text={concept.display} value={concept.uuid}>
                        {concept.display}
                      </SelectItem>
                    ))}
                </Select>
              )}
            />
            {errors.queueConcept && (
              <section>
                <InlineNotification
                  style={{ margin: '0', minWidth: '100%' }}
                  kind="error"
                  lowContrast={true}
                  title={t('missingService', 'Missing service')}
                  subtitle={errors.queueConcept.message}
                />
              </section>
            )}
          </Layer>
        </Column>

        <Column>
          <Layer className={styles.input}>
            <Controller
              name="userLocation"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelText={t('selectALocation', 'Select a location')}
                  id="location"
                  invalidText={errors.userLocation?.message}
                  invalid={!!errors.userLocation}>
                  {!field.value && <SelectItem text={t('selectALocation', 'Select a location')} />}
                  {queueLocations.length === 0 && (
                    <SelectItem text={t('noLocationsAvailable', 'No locations available')} />
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
            {errors.userLocation && (
              <section>
                <InlineNotification
                  style={{ margin: '0', minWidth: '100%' }}
                  kind="error"
                  lowContrast={true}
                  title={t('missingLocation', 'Missing location')}
                  subtitle={errors.userLocation.message}
                />
              </section>
            )}
          </Layer>
        </Column>
      </Stack>
      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit">
          {t('save', 'Save')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default QueueServiceForm;
