import React from 'react';
import classNames from 'classnames';
import { type TFunction, useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import { mutate } from 'swr';
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
} from '@carbon/react';
import {
  type DefaultWorkspaceProps,
  getCoreTranslation,
  restBaseUrl,
  showSnackbar,
  useLayoutType,
} from '@openmrs/esm-framework';
import { saveQueueRoom } from './queue-room.resource';
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
import { useQueues } from '../hooks/useQueues';
import styles from './queue-room-form.scss';

const createQueueRoomSchema = (t: TFunction) =>
  z.object({
    queueRoomName: z
      .string({
        required_error: t('queueRoomNameIsRequired', 'Queue room name is required'),
      })
      .trim()
      .min(1, t('queueRoomNameIsRequired', 'Queue room name is required')),
    queueRoomService: z
      .string({
        required_error: t('queueRoomServiceIsRequired', 'Queue room service is required'),
      })
      .trim()
      .min(1, t('queueRoomServiceIsRequired', 'Queue room service is required')),
    queueLocation: z
      .string({
        required_error: t('queueLocationRequired', 'Queue location is required'),
      })
      .trim()
      .min(1, t('queueLocationRequired', 'Queue location is required')),
  });

type QueueRoomFormData = z.infer<ReturnType<typeof createQueueRoomSchema>>;

const QueueRoomForm: React.FC<DefaultWorkspaceProps> = ({ closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<QueueRoomFormData>({
    resolver: zodResolver(createQueueRoomSchema(t)),
    defaultValues: {
      queueRoomName: '',
      queueRoomService: '',
      queueLocation: '',
    },
  });

  const watchedQueueLocationId = watch('queueLocation');
  const { queues } = useQueues(watchedQueueLocationId);
  const { queueLocations } = useQueueLocations();

  const onSubmit = async (data: QueueRoomFormData) => {
    try {
      // FIXME: We should collect a queue room description and pass it as the second argument
      await saveQueueRoom(data.queueRoomName, '', data.queueRoomService);

      showSnackbar({
        title: t('queueRoomAdded', 'Queue room added'),
        kind: 'success',
        subtitle: t('queueRoomCreatedSuccessfully', 'Queue room created successfully'),
      });

      await mutate(`${restBaseUrl}/queueroom`);
      closeWorkspace();
    } catch (error) {
      showSnackbar({
        title: t('errorCreatingQueueRoom', 'Error creating queue room'),
        kind: 'error',
        isLowContrast: false,
        subtitle: error?.message,
      });
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
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
                  labelText={t('queueRoomService', 'Queue room service')}
                  onChange={(e) => onChange(e.target.value)}
                  value={value || ''}>
                  <SelectItem text={t('selectQueueRoomService', 'Select a queue room service')} value="" />
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
      </Stack>
      <ButtonSet className={classNames(isTablet ? styles.tablet : styles.desktop)}>
        <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
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
  );
};

export default QueueRoomForm;
