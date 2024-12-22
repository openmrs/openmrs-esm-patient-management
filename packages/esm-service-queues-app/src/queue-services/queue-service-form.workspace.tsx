import React from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Button,
  ButtonSet,
  Column,
  Form,
  Layer,
  Select,
  SelectItem,
  Stack,
  TextInput,
  InlineLoading,
} from '@carbon/react';
import { mutate } from 'swr';
import { type DefaultWorkspaceProps, restBaseUrl, showSnackbar } from '@openmrs/esm-framework';
import { saveQueue, useServiceConcepts } from './queue-service.resource';
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
import styles from './queue-service-form.scss';
import { t } from 'i18next';
import type { TFunction } from 'i18next';

const createQueueServiceSchema = (t: TFunction) =>
  z.object({
    queueName: z
      .string({
        required_error: t('queueNameRequired', 'Queue name is required'),
      })
      .trim()
      .min(1, t('queueNameRequired', 'Queue name is required')),
    queueConcept: z.string({
      required_error: t('queueConceptRequired', 'Queue concept is required'),
    }),
    userLocation: z.string({
      required_error: t('queueLocationRequired', 'Queue location is required'),
    }),
  });

type QueueServiceFormData = z.infer<ReturnType<typeof createQueueServiceSchema>>;

const QueueServiceForm: React.FC<DefaultWorkspaceProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const { queueConcepts } = useServiceConcepts();
  const { queueLocations } = useQueueLocations();
  const QueueServiceSchema = createQueueServiceSchema(t);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QueueServiceFormData>({
    resolver: zodResolver(QueueServiceSchema),
    defaultValues: {
      queueName: '',
      queueConcept: '',
      userLocation: '',
    },
  });

  const createQueue = (data: QueueServiceFormData) => {
    saveQueue(data.queueName, data.queueConcept, '', data.userLocation)
      .then(() => {
        showSnackbar({
          title: t('addQueue', 'Add queue'),
          kind: 'success',
          subtitle: t('queueAddedSuccessfully', 'Queue added successfully'),
        });
        closeWorkspace();
        mutate(`${restBaseUrl}/queue?${data.userLocation}`);
        mutate(`${restBaseUrl}/queue?location=${data.userLocation}`);
      })
      .catch((error) => {
        showSnackbar({
          title: t('errorAddingQueue', 'Error adding queue'),
          kind: 'error',
          isLowContrast: false,
          subtitle: error?.message,
        });
      });
  };

  return (
    <Form onSubmit={handleSubmit(createQueue)} className={styles.form}>
      <Stack gap={5} className={styles.grid}>
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
                  invalid={!!errors?.queueConcept}
                  invalidText={errors?.queueConcept?.message}>
                  {!field.value && <SelectItem text={t('selectServiceType', 'Select a service type')} value="" />}
                  {queueConcepts.length === 0 && (
                    <SelectItem text={t('noServicesAvailable', 'No services available')} value="" />
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
          </Layer>
        </Column>

        <Column>
          <Layer className={styles.input}>
            <Controller
              name="userLocation"
              control={control}
              render={({ field }) => (
                <Select
                  disabled={queueLocations.length === 0}
                  {...field}
                  id="location"
                  invalid={errors?.userLocation}
                  invalidText={errors?.userLocation?.message}
                  labelText={t('selectALocation', 'Select a location')}>
                  {!field.value && <SelectItem text={t('selectALocation', 'Select a location')} value="" />}
                  {queueLocations?.length > 0 &&
                    queueLocations.map((location) => (
                      <SelectItem key={location.id} text={location.name} value={location.id}>
                        {location.name}
                      </SelectItem>
                    ))}
                </Select>
              )}
            />
          </Layer>
        </Column>
      </Stack>
      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'Saving') + '...'} />
          ) : (
            <span>{t('save', 'Save')}</span>
          )}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default QueueServiceForm;
