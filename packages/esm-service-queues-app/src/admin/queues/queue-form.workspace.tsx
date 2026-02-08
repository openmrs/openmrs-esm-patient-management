import React from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  ButtonSet,
  Column,
  Form,
  InlineLoading,
  Layer,
  Select,
  Stack,
  SelectItem,
  TextInput,
  TextArea,
} from '@carbon/react';
import { useSWRConfig } from 'swr';
import { restBaseUrl, showSnackbar, Workspace2, type Workspace2DefinitionProps } from '@openmrs/esm-framework';
import { saveQueue, updateQueue, useServiceConcepts } from './queue.resource';
import { useQueueLocations } from '../../create-queue-entry/hooks/useQueueLocations';
import styles from './queue-form.scss';

const createQueueSchema = (t: TFunction) =>
  z.object({
    queueName: z
      .string({
        required_error: t('queueNameRequired', 'Queue name is required'),
      })
      .trim()
      .min(1, t('queueNameRequired', 'Queue name is required')),
    queueServiceType: z
      .string({
        required_error: t('queueConceptRequired', 'Queue concept is required'),
      })
      .trim()
      .min(1, t('queueConceptRequired', 'Queue concept is required')),
    userLocation: z
      .string({
        required_error: t('queueLocationRequired', 'Queue location is required'),
      })
      .trim()
      .min(1, t('queueLocationRequired', 'Queue location is required')),
    description: z.string().optional(),
  });

type QueueFormData = z.infer<ReturnType<typeof createQueueSchema>>;

interface QueueWorkspaceProps {
  queue?: {
    uuid: string;
    name: string;
    description?: string;
    service: { uuid: string; display: string };
    location: { uuid: string; display: string };
  };
}

const QueueForm: React.FC<Workspace2DefinitionProps<QueueWorkspaceProps>> = ({ closeWorkspace, workspaceProps }) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const { queueConcepts } = useServiceConcepts();
  const { queueLocations } = useQueueLocations();
  const queueToEdit = workspaceProps?.queue;
  const isEditMode = !!queueToEdit;

  const QueueSchema = createQueueSchema(t);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QueueFormData>({
    resolver: zodResolver(QueueSchema),
    defaultValues: {
      queueName: queueToEdit?.name || '',
      queueServiceType: queueToEdit?.service?.uuid || '',
      userLocation: queueToEdit?.location?.uuid || '',
      description: queueToEdit?.description || '',
    },
  });

  const handleSaveQueue = async (data: QueueFormData) => {
    try {
      if (isEditMode) {
        await updateQueue(queueToEdit.uuid, data.queueName, data.queueServiceType, data.description, data.userLocation);
        showSnackbar({
          title: t('queueUpdated', 'Queue updated'),
          kind: 'success',
          subtitle: `${data.queueName}`,
        });
      } else {
        await saveQueue(data.queueName, data.queueServiceType, data.description, data.userLocation);
        showSnackbar({
          title: t('queueCreated', 'Queue created'),
          kind: 'success',
          subtitle: `${data.queueName}`,
        });
      }

      closeWorkspace();
      await mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/queue?`));
    } catch (error) {
      showSnackbar({
        title: isEditMode
          ? t('errorUpdatingQueue', 'Error updating queue')
          : t('errorCreatingQueue', 'Error creating queue'),
        kind: 'error',
        isLowContrast: false,
        subtitle: error?.responseBody?.message || error?.message,
      });
    }
  };

  return (
    <Workspace2 title={isEditMode ? t('editQueue', 'Edit queue') : t('addNewQueue', 'Add new queue')}>
      <Form onSubmit={handleSubmit(handleSaveQueue)} className={styles.form}>
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
                name="queueServiceType"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    labelText={t('selectServiceType', 'Select a service type')}
                    id="queueServiceType"
                    invalid={!!errors?.queueServiceType}
                    invalidText={errors?.queueServiceType?.message}>
                    <SelectItem text={t('selectServiceType', 'Select a service type')} value="" />
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
                    {...field}
                    id="location"
                    invalid={!!errors?.userLocation}
                    invalidText={errors?.userLocation?.message}
                    labelText={t('selectALocation', 'Select a location')}>
                    <SelectItem text={t('selectALocation', 'Select a location')} value="" />
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
          <Column>
            <Layer className={styles.input}>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <TextArea
                    {...field}
                    id="description"
                    labelText={t('description', 'Description')}
                    invalid={!!errors.description}
                    invalidText={errors.description?.message}
                  />
                )}
              />
            </Layer>
          </Column>
        </Stack>
        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
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
    </Workspace2>
  );
};

export default QueueForm;
