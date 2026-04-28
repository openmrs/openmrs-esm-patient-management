import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { type TFunction } from 'i18next';
import { Controller, useForm } from 'react-hook-form';
import { useSWRConfig } from 'swr';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Button,
  ButtonSet,
  Column,
  Form,
  InlineLoading,
  Layer,
  Select,
  SelectItem,
  Stack,
  TextInput,
  TextArea,
} from '@carbon/react';
import {
  getCoreTranslation,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import { saveQueueRoom, updateQueueRoom } from './queue-room.resource';
import { useQueueLocations } from '../../create-queue-entry/hooks/useQueueLocations';
import { useQueues } from '../../hooks/useQueues';
import styles from './queue-room-form.scss';

const createQueueRoomSchema = (t: TFunction, isEditMode: boolean) =>
  z.object({
    queueRoomName: z
      .string({
        required_error: t('queueRoomNameIsRequired', 'Queue room name is required'),
      })
      .trim()
      .min(1, t('queueRoomNameIsRequired', 'Queue room name is required')),
    queueRoomService: z
      .string({
        required_error: t('queueRequired', 'Queue is required'),
      })
      .trim()
      .min(1, t('queueRequired', 'Queue is required')),
    queueLocation: isEditMode
      ? z.string().optional()
      : z
          .string({
            required_error: t('queueLocationRequired', 'Queue location is required'),
          })
          .trim()
          .min(1, t('queueLocationRequired', 'Queue location is required')),
    description: z.string().optional(),
  });

type QueueRoomFormData = z.infer<ReturnType<typeof createQueueRoomSchema>>;

interface QueueRoomWorkspaceProps {
  queueRoom?: {
    uuid: string;
    name: string;
    description?: string;
    queue: { uuid: string; display: string };
  };
}

const QueueRoomForm: React.FC<Workspace2DefinitionProps<QueueRoomWorkspaceProps>> = ({
  closeWorkspace,
  workspaceProps,
}) => {
  const { t } = useTranslation();
  const { mutate } = useSWRConfig();
  const isTablet = useLayoutType() === 'tablet';
  const queueRoomToEdit = workspaceProps?.queueRoom;
  const isEditMode = !!queueRoomToEdit;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QueueRoomFormData>({
    resolver: zodResolver(createQueueRoomSchema(t, isEditMode)),
    defaultValues: {
      queueRoomName: queueRoomToEdit?.name || '',
      queueRoomService: queueRoomToEdit?.queue?.uuid || '',
      queueLocation: '',
      description: queueRoomToEdit?.description || '',
    },
  });

  const watchedQueueLocationId = watch('queueLocation');
  const { queues } = useQueues(isEditMode ? undefined : watchedQueueLocationId);
  const { queueLocations } = useQueueLocations();

  const handleSaveQueueRoom = async (data: QueueRoomFormData) => {
    try {
      if (isEditMode) {
        await updateQueueRoom(queueRoomToEdit.uuid, data.queueRoomName, data.description, data.queueRoomService);
        showSnackbar({
          title: t('queueRoomUpdated', 'Queue room updated'),
          kind: 'success',
          subtitle: `${data.queueRoomName}`,
        });
      } else {
        await saveQueueRoom(data.queueRoomName, data.description, data.queueRoomService);
        showSnackbar({
          title: t('queueRoomCreated', 'Queue room created'),
          kind: 'success',
          subtitle: `${data.queueRoomName}`,
        });
      }

      await mutate((key) => typeof key === 'string' && key.startsWith(`${restBaseUrl}/queue-room?`));
      closeWorkspace();
    } catch (error) {
      showSnackbar({
        title: isEditMode
          ? t('errorUpdatingQueueRoom', 'Error updating queue room')
          : t('errorCreatingQueueRoom', 'Error creating queue room'),
        kind: 'error',
        isLowContrast: false,
        subtitle: error?.responseBody?.message || error?.message,
      });
    }
  };

  return (
    <Workspace2 title={isEditMode ? t('editQueueRoom', 'Edit queue room') : t('addNewQueueRoom', 'Add new queue room')}>
      <Form onSubmit={handleSubmit(handleSaveQueueRoom)} className={styles.form}>
        <Stack gap={4} className={styles.grid}>
          <Column>
            <Layer className={styles.input}>
              <Controller
                control={control}
                name="queueRoomName"
                render={({ field }) => (
                  <TextInput
                    {...field}
                    id="queueRoomName"
                    invalid={!!errors.queueRoomName}
                    invalidText={errors.queueRoomName?.message}
                    labelText={t('queueRoomName', 'Queue room name')}
                  />
                )}
              />
            </Layer>
          </Column>

          <Column>
            <Layer className={styles.input}>
              <Controller
                name="queueLocation"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Select
                    {...field}
                    id="queueRoomLocation"
                    invalid={!!errors.queueLocation}
                    invalidText={errors.queueLocation?.message}
                    labelText={t('queueLocation', 'Queue location')}
                    onChange={(e) => onChange(e.target.value)}
                    value={value || ''}>
                    <SelectItem text={t('selectQueueRoomLocation', 'Select a queue room location')} value="" />
                    {queueLocations?.map((location) => (
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
                name="queueRoomService"
                control={control}
                render={({ field: { onChange, value, ...field } }) => (
                  <Select
                    {...field}
                    id="queueRoomService"
                    invalid={!!errors.queueRoomService}
                    invalidText={errors.queueRoomService?.message}
                    labelText={t('queue', 'Queue')}
                    onChange={(e) => onChange(e.target.value)}
                    value={value || ''}>
                    <SelectItem text={t('selectQueue', 'Select a queue')} value="" />
                    {queues?.map((service) => (
                      <SelectItem key={service.uuid} text={service.display} value={service.uuid}>
                        {service.display}
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
        <ButtonSet className={classNames(isTablet ? styles.tablet : styles.desktop)}>
          <Button className={styles.button} kind="secondary" onClick={() => closeWorkspace()}>
            {getCoreTranslation('cancel', 'Cancel')}
          </Button>
          <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
            {isSubmitting ? (
              <InlineLoading description={t('saving', 'Saving') + '...'} />
            ) : (
              <span>{getCoreTranslation('save', 'Save')}</span>
            )}{' '}
          </Button>
        </ButtonSet>
      </Form>
    </Workspace2>
  );
};

export default QueueRoomForm;
