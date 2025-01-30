import React from 'react';
import { type TFunction, useTranslation } from 'react-i18next';
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
  InlineLoading,
} from '@carbon/react';
import { type DefaultWorkspaceProps, restBaseUrl, showSnackbar, useLayoutType } from '@openmrs/esm-framework';
import { mutate } from 'swr';
import { useQueueLocations } from '../create-queue-entry/hooks/useQueueLocations';
import { saveQueueRoom } from './queue-room.resource';
import styles from './queue-room-form.scss';
import { useQueues } from '../hooks/useQueues';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import classNames from 'classnames';

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
      await saveQueueRoom(data.queueRoomName, data.queueRoomName, data.queueRoomService);

      showSnackbar({
        title: t('addQueueRoom', 'Add queue room'),
        kind: 'success',
        subtitle: t('queueRoomAddedSuccessfully', 'Queue room added successfully'),
      });
      closeWorkspace();
      await mutate(`${restBaseUrl}/queueroom`);
    } catch (error) {
      showSnackbar({
        title: t('errorAddingQueueRoom', 'Error adding queue room'),
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
                  invalidText={errors.queueRoomName?.message}
                  invalid={!!errors.queueRoomName}
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
                  value={value || ''}
                  onChange={(e) => onChange(e.target.value)}
                  labelText={t('queueLocation', 'Queue location')}
                  id="location"
                  invalidText={errors.queueLocation?.message}
                  invalid={!!errors.queueLocation}>
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
                  value={value || ''}
                  onChange={(e) => {
                    onChange(e.target.value);
                  }}
                  labelText={t('queueRoomService', 'Queue room service')}
                  id="service"
                  invalidText={errors.queueRoomService?.message}
                  invalid={!!errors.queueRoomService}>
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
          {t('cancel', 'Cancel')}
        </Button>
        <Button className={styles.button} kind="primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <InlineLoading description={t('saving', 'Saving') + '...'} />
          ) : (
            <span>{t('save', 'Save')}</span>
          )}{' '}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default QueueRoomForm;
