import React, { useEffect } from 'react';
import {
  type DefaultWorkspaceProps,
  ResponsiveWrapper,
  useLayoutType,
  useSession,
  showSnackbar,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { Controller, useForm } from 'react-hook-form';
import styles from './add-edit-bed.workspace.scss';
import {
  ButtonSet,
  Button,
  InlineLoading,
  TextInput,
  NumberInput,
  TextArea,
  Select,
  SelectItem,
  ComboBox,
  Form,
  Stack,
} from '@carbon/react';
import classNames from 'classnames';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import capitalize from 'lodash-es/capitalize';
import { useBedTags, useLocationsWithAdmissionTag } from '../../summary/summary.resource';
import { type InitialData } from '../../types';
import { editBed, saveBed, useBedType } from './add-edit-bed.resource';

type AddEditBedWorkspaceProps = DefaultWorkspaceProps & {
  bed?: InitialData;
  mutateBeds: () => void;
  defaultLocation?: { display: string; uuid: string };
};

const AddEditBedWorkspace: React.FC<AddEditBedWorkspaceProps> = ({
  closeWorkspace,
  closeWorkspaceWithSavedChanges,
  promptBeforeClosing,
  bed,
  mutateBeds,
  defaultLocation,
}) => {
  const { t } = useTranslation();
  const session = useSession();
  const locationUuid = session?.sessionLocation?.uuid;
  const isTablet = useLayoutType() === 'tablet';

  const { admissionLocations } = useLocationsWithAdmissionTag();
  const { bedTypes } = useBedType();
  const { bedTags } = useBedTags();

  const numberInString = z.string().transform((val, ctx) => {
    const parsed = parseInt(val);
    if (isNaN(parsed) || parsed < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: t('validNumberRequired', 'Please enter a valid number'),
      });
      return z.NEVER;
    }
    return val;
  });

  const bedFormSchema = z.object({
    bedId: z
      .string()
      .min(5, t('bedIdMinLength', 'Bed ID must be at least 5 characters'))
      .max(255, t('bedIdMaxLength', 'Bed ID must not exceed 255 characters')),
    description: z.string().max(255, t('descriptionMaxLength', 'Description must not exceed 255 characters')),
    bedRow: numberInString,
    bedColumn: numberInString,
    location: z
      .object({ display: z.string(), uuid: z.string() })
      .refine((value) => value.display !== '', t('selectValidLocation', 'Please select a valid location')),
    occupancyStatus: z
      .string()
      .refine((value) => value !== '', t('selectValidOccupancyStatus', 'Please select a valid occupancy status')),
    bedType: z.string().refine((value) => value !== '', t('selectValidBedType', 'Please select a valid bed type')),
    bedTags: z
      .array(
        z.object({
          id: z
            .union([z.string(), z.number()])
            .transform((val) => val.toString())
            .optional(),
          name: z.string(),
          uuid: z.string().optional(),
        }),
      )
      .optional(),
  });

  type BedFormType = z.infer<typeof bedFormSchema>;

  const occupancyStatuses = ['Available', 'Occupied'];
  const availableBedTypes = bedTypes ? bedTypes : [];
  const availableBedTags = bedTags ? bedTags : [];
  const allLocations = admissionLocations || [];
  const hasLocations = allLocations.length > 0;

  const sessionLocation = allLocations.find((loc) => loc.uuid === locationUuid);

  const defaultValues = bed
    ? {
        bedId: bed.bedNumber,
        description: bed.description || '',
        bedRow: bed.row?.toString() || '1',
        bedColumn: bed.column?.toString() || '1',
        location: bed.location || { display: '', uuid: '' },
        occupancyStatus: capitalize(bed.status) || 'Available',
        bedType: bed.bedType?.name || '',
        bedTags: bed.bedTags || [],
      }
    : {
        bedId: '',
        description: '',
        bedRow: '1',
        bedColumn: '1',
        location: defaultLocation || sessionLocation || { display: '', uuid: '' },
        occupancyStatus: 'Available',
        bedType: '',
        bedTags: [],
      };

  const {
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<BedFormType>({
    resolver: zodResolver(bedFormSchema),
    defaultValues: defaultValues,
  });

  const onSubmit = async (data: BedFormType) => {
    const bedPayload = {
      ...(bed?.uuid && { uuid: bed.uuid }),
      bedNumber: data.bedId,
      bedType: data.bedType,
      description: data.description,
      status: data.occupancyStatus.toUpperCase(),
      row: parseInt(data.bedRow.toString()),
      column: parseInt(data.bedColumn.toString()),
      locationUuid: data.location.uuid,
      bedTag: (data.bedTags || []).map((tag) => ({
        ...tag,
        name: tag.name || '',
      })),
    };

    try {
      let response;

      if (bed?.uuid) {
        response = await editBed({
          bedPayload,
          bedId: bed.uuid,
        });
      } else {
        response = await saveBed({ bedPayload });
      }

      if (response.status === 201 || response.status === 200) {
        showSnackbar({
          title: t('success', 'Success'),
          kind: 'success',
          subtitle: bed?.uuid
            ? t('bedUpdated', 'Bed updated successfully')
            : t('bedCreated', 'Bed created successfully'),
        });
      }
      mutateBeds();
      closeWorkspaceWithSavedChanges();
    } catch (error: any) {
      showSnackbar({
        title: t('error', 'Error'),
        kind: 'error',
        subtitle: error?.message ?? t('bedSaveError', 'Error saving bed'),
      });
    }
  };

  useEffect(() => {
    promptBeforeClosing(() => isDirty);
  }, [isDirty, promptBeforeClosing]);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
      <Stack gap={5}>
        <div className={styles.formContainer}>
          <ResponsiveWrapper>
            <Controller
              control={control}
              name="bedId"
              render={({ field }) => (
                <TextInput
                  id="bedId"
                  placeholder={t('bedIdPlaceholder', 'e.g. CHA-201')}
                  labelText={t('bedId', 'Bed number')}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.bedId?.message}
                  invalidText={errors.bedId?.message}
                />
              )}
            />
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <TextArea
                  id="description"
                  placeholder={t('descriptionPlaceholder', 'Enter bed description')}
                  labelText={t('description', 'Description')}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.description?.message}
                  invalidText={errors.description?.message}
                  rows={3}
                />
              )}
            />
          </ResponsiveWrapper>

          <div className={styles.rowContainer}>
            <ResponsiveWrapper>
              <Controller
                control={control}
                name="bedRow"
                render={({ field }) => (
                  <NumberInput
                    id="bedRow"
                    label={t('bedRow', 'Bed row')}
                    hideSteppers
                    value={field.value}
                    onChange={(e, { value }) => field.onChange(value.toString())}
                    invalid={!!errors.bedRow?.message}
                    invalidText={errors.bedRow?.message}
                  />
                )}
              />
            </ResponsiveWrapper>
          </div>
          <div className={styles.rowContainer}>
            <ResponsiveWrapper>
              <Controller
                control={control}
                name="bedColumn"
                render={({ field }) => (
                  <NumberInput
                    id="bedColumn"
                    label={t('bedColumn', 'Bed column')}
                    hideSteppers
                    value={field.value}
                    onChange={(e, { value }) => field.onChange(value.toString())}
                    invalid={!!errors.bedColumn?.message}
                    invalidText={errors.bedColumn?.message}
                  />
                )}
              />
            </ResponsiveWrapper>
          </div>

          <ResponsiveWrapper>
            <div className={styles.locationFieldContainer}>
              <Controller
                control={control}
                name="location"
                render={({ field: { onChange, onBlur, value, ref } }) => (
                  <ComboBox
                    id="location"
                    titleText={t('location', 'Location')}
                    placeholder={
                      hasLocations
                        ? t('selectLocation', 'Select a location')
                        : t('noLocationsAvailable', 'No locations available')
                    }
                    items={allLocations}
                    itemToString={(location) => location?.display ?? ''}
                    selectedItem={value}
                    onChange={({ selectedItem }) => onChange(selectedItem)}
                    onBlur={onBlur}
                    ref={ref}
                    invalid={!!errors.location?.message}
                    invalidText={errors.location?.message}
                    disabled={!hasLocations}
                  />
                )}
              />
            </div>
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <Controller
              control={control}
              name="occupancyStatus"
              render={({ field }) => (
                <Select
                  id="occupancyStatus"
                  labelText={t('occupancyStatus', 'Occupancy Status')}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.occupancyStatus?.message}
                  invalidText={errors.occupancyStatus?.message}>
                  <SelectItem text={t('selectOccupancyStatus', 'Select occupancy status')} value="" />
                  {occupancyStatuses.map((status, index) => (
                    <SelectItem key={`occupancy-${index}`} text={t(status.toLowerCase(), status)} value={status} />
                  ))}
                </Select>
              )}
            />
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <Controller
              control={control}
              name="bedType"
              render={({ field }) => (
                <Select
                  id="bedType"
                  labelText={t('bedType', 'Bed Type')}
                  value={field.value}
                  onChange={field.onChange}
                  invalid={!!errors.bedType?.message}
                  invalidText={errors.bedType?.message}>
                  <SelectItem text={t('selectBedType', 'Select bed type')} value="" />
                  {availableBedTypes.map((bedType, index) => (
                    <SelectItem key={`bedType-${index}`} text={bedType.name} value={bedType.name} />
                  ))}
                </Select>
              )}
            />
          </ResponsiveWrapper>

          <ResponsiveWrapper>
            <Controller
              control={control}
              name="bedTags"
              render={({ field: { onChange, onBlur, value, ref } }) => (
                <div>
                  <ComboBox
                    id="bedTags"
                    titleText={t('bedTags', 'Bed Tags')}
                    placeholder={t('selectBedTags', 'Select bed tags')}
                    items={availableBedTags}
                    itemToString={(item) => item?.name ?? ''}
                    selectedItem={null}
                    onChange={({ selectedItem }) => {
                      if (
                        selectedItem &&
                        !value?.some((tag) => (tag.id || tag.uuid) === (selectedItem.id || selectedItem.uuid))
                      ) {
                        onChange([...(value || []), selectedItem]);
                      }
                    }}
                    onBlur={onBlur}
                    ref={ref}
                    invalid={!!errors.bedTags?.message}
                    invalidText={errors.bedTags?.message}
                  />
                </div>
              )}
            />
          </ResponsiveWrapper>
        </div>

        <ButtonSet
          className={classNames({
            [styles.tablet]: isTablet,
            [styles.desktop]: !isTablet,
          })}>
          <Button className={styles.buttonContainer} kind="secondary" onClick={() => closeWorkspace()}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button
            disabled={isSubmitting || !isDirty || !hasLocations}
            className={styles.button}
            kind="primary"
            type="submit">
            {isSubmitting ? (
              <InlineLoading className={styles.spinner} description={t('saving', 'Saving') + '...'} />
            ) : (
              <span>{t('saveAndClose', 'Save & close')}</span>
            )}
          </Button>
        </ButtonSet>
      </Stack>
    </Form>
  );
};

export default AddEditBedWorkspace;
