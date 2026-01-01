import React, { useCallback, useEffect } from 'react';
import classNames from 'classnames';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  ComboBox,
  Form,
  InlineLoading,
  MultiSelect,
  NumberInput,
  Select,
  SelectItem,
  Stack,
  Tag,
  TextInput,
} from '@carbon/react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  getCoreTranslation,
  ResponsiveWrapper,
  showSnackbar,
  useLayoutType,
  useSession,
  type Workspace2DefinitionProps,
  Workspace2,
} from '@openmrs/esm-framework';
import { type BedFormWorkspaceConfig, type BedPostPayload } from '../../types';
import { useBedTags, useLocationsWithAdmissionTag } from '../../summary/summary.resource';
import { editBed, saveBed, useBedType, useBedTagMappings } from './bed-form.resource';
import styles from './bed-form.workspace.scss';

const OCCUPANCY_STATUSES = ['AVAILABLE', 'OCCUPIED'] as const;
type OccupancyStatus = (typeof OCCUPANCY_STATUSES)[number];

const BedFormWorkspace: React.FC<Workspace2DefinitionProps<BedFormWorkspaceConfig>> = ({
  workspaceProps: { bed, mutateBeds, defaultLocation },
  closeWorkspace,
}) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const session = useSession();
  const locationUuid = session?.sessionLocation?.uuid;
  const isEditing = !!bed?.uuid;
  const { admissionLocations } = useLocationsWithAdmissionTag();
  const { bedTypes } = useBedType();
  const { bedTags } = useBedTags();
  const { bedTagMappings, isLoading: isLoadingBedTags } = useBedTagMappings(isEditing ? bed?.uuid : undefined);

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
    bedNumber: z
      .string()
      .min(1, t('bedNumberRequired', 'Bed number is required'))
      .max(10, t('bedNumberMaxLength', 'Bed number must not exceed 10 characters')),
    bedRow: numberInString,
    bedColumn: numberInString,
    location: z
      .object({ display: z.string(), uuid: z.string() })
      .refine((value) => value.display !== '', t('selectValidLocation', 'Please select a valid location')),
    occupancyStatus: z.enum(['AVAILABLE', 'OCCUPIED']),
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
  const sessionLocation = allLocations.find((location) => location.uuid === locationUuid);

  const getDefaultValues = useCallback(() => {
    if (isEditing) {
      return {
        bedNumber: bed.bedNumber,
        bedRow: bed.row?.toString() || '1',
        bedColumn: bed.column?.toString() || '1',
        location: bed.location || { display: '', uuid: '' },
        occupancyStatus: (bed.status?.toUpperCase() as OccupancyStatus) || OCCUPANCY_STATUSES[0],
        bedType: bed.bedType?.name || '',
        bedTags: bedTagMappings.length > 0 ? bedTagMappings : bed.bedTags || [],
      };
    }
    return {
      bedNumber: '',
      bedRow: '1',
      bedColumn: '1',
      location: defaultLocation || sessionLocation || { display: '', uuid: '' },
      occupancyStatus: 'AVAILABLE' as OccupancyStatus,
      bedType: '',
      bedTags: [],
    };
  }, [
    isEditing,
    bed?.bedNumber,
    bed?.row,
    bed?.column,
    bed?.location,
    bed?.status,
    bed?.bedType?.name,
    bed?.bedTags,
    bedTagMappings,
    defaultLocation,
    sessionLocation,
  ]);

  const defaultValues = getDefaultValues();

  const {
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, isDirty, errors },
  } = useForm<BedFormType>({
    resolver: zodResolver(bedFormSchema),
    defaultValues: defaultValues,
  });

  useEffect(() => {
    if (isEditing && bedTagMappings.length > 0 && !isLoadingBedTags) {
      const updatedDefaults = getDefaultValues();
      reset(updatedDefaults);
    }
  }, [bedTagMappings, getDefaultValues, isLoadingBedTags, isEditing, reset]);

  const createBedPayload = (data: BedFormType) => ({
    ...(isEditing && { uuid: bed.uuid }),
    bedNumber: data.bedNumber,
    bedType: data.bedType,
    status: data.occupancyStatus.toUpperCase(),
    row: parseInt(data.bedRow.toString()),
    column: parseInt(data.bedColumn.toString()),
    locationUuid: data.location.uuid,
    bedTag: (data.bedTags || []).map((tag) => ({
      ...tag,
      name: tag.name || '',
    })),
  });

  const handleBedSubmission = async (bedPayload: BedPostPayload) =>
    isEditing ? await editBed({ bedPayload, bedUuid: bed.uuid }) : await saveBed({ bedPayload });

  const onSubmit = async (data: BedFormType) => {
    const bedPayload = createBedPayload(data);

    try {
      await handleBedSubmission(bedPayload);

      showSnackbar({
        title: t('success', 'Success'),
        kind: 'success',
        subtitle: isEditing ? t('bedUpdated', 'Bed updated successfully') : t('bedCreated', 'Bed created successfully'),
      });

      mutateBeds();
      closeWorkspace({ discardUnsavedChanges: true });
    } catch (error: unknown) {
      const subtitle =
        error instanceof Error && error.message
          ? error.message
          : isEditing
            ? t('bedUpdateError', 'Error updating bed')
            : t('bedCreateError', 'Error creating bed');

      showSnackbar({
        title: t('error', 'Error'),
        kind: 'error',
        subtitle,
      });
    }
  };

  const title = isEditing ? t('editBed', 'Edit bed') : t('addBed', 'Add bed');

  return (
    <Workspace2 title={title} hasUnsavedChanges={isDirty}>
      <Form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.formContainer}>
          <Stack gap={5}>
            <ResponsiveWrapper>
              <Controller
                control={control}
                name="bedNumber"
                render={({ field }) => (
                  <TextInput
                    helperText={t('bedNumberMaxCharsHelper', 'Maximum 10 characters')}
                    id="bedNumber"
                    invalid={!!errors.bedNumber?.message}
                    invalidText={errors.bedNumber?.message}
                    labelText={t('bedNumber', 'Bed number')}
                    onChange={field.onChange}
                    placeholder={t('bedNumberPlaceholder', 'e.g. CHA-201')}
                    value={field.value}
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
                      hideSteppers
                      id="bedRow"
                      invalid={!!errors.bedRow?.message}
                      invalidText={errors.bedRow?.message}
                      label={t('bedRow', 'Bed row')}
                      onChange={(e, { value }) => field.onChange(value.toString())}
                      value={field.value}
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
                      hideSteppers
                      id="bedColumn"
                      invalid={!!errors.bedColumn?.message}
                      invalidText={errors.bedColumn?.message}
                      label={t('bedColumn', 'Bed column')}
                      onChange={(e, { value }) => field.onChange(value.toString())}
                      value={field.value}
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
                      disabled={!hasLocations}
                      id="location"
                      invalid={!!errors.location?.message}
                      invalidText={errors.location?.message}
                      items={allLocations}
                      itemToString={(location) => location?.display ?? ''}
                      onBlur={onBlur}
                      onChange={({ selectedItem }) => onChange(selectedItem)}
                      placeholder={
                        hasLocations
                          ? t('selectLocation', 'Select a location')
                          : t('noLocationsAvailable', 'No locations available')
                      }
                      ref={ref}
                      selectedItem={value}
                      titleText={t('location', 'Location')}
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
                    invalid={!!errors.occupancyStatus?.message}
                    invalidText={errors.occupancyStatus?.message}
                    labelText={t('occupancyStatus', 'Occupancy status')}
                    onChange={field.onChange}
                    value={field.value}>
                    <SelectItem text={t('selectOccupancyStatus', 'Select occupancy status')} value="" />
                    {occupancyStatuses.map((status, index) => (
                      <SelectItem
                        key={`occupancy-${index}`}
                        text={t(status.toLowerCase(), status)}
                        value={status.toUpperCase()}
                      />
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
                    disabled={!availableBedTypes.length}
                    id="bedType"
                    invalid={!!errors.bedType?.message}
                    invalidText={errors.bedType?.message}
                    labelText={t('bedType', 'Bed Type')}
                    onChange={field.onChange}
                    value={field.value}>
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
                render={({ field: { onChange, value } }) => {
                  const selectedItems = (value || [])
                    .map((tag) => {
                      const fullTag = availableBedTags.find((t) => t.uuid === tag.uuid || t.name === tag.name);
                      return fullTag || tag;
                    })
                    .filter(Boolean);

                  return (
                    <div>
                      <MultiSelect
                        disabled={!availableBedTags.length}
                        id="bedTags"
                        invalid={!!errors.bedTags?.message}
                        invalidText={errors.bedTags?.message}
                        items={availableBedTags}
                        itemToString={(item) => item?.name ?? ''}
                        label={t('selectBedTags', 'Select bed tags')}
                        onChange={({ selectedItems }) => onChange(selectedItems)}
                        selectedItems={selectedItems}
                        titleText={t('bedTags', 'Bed Tags')}
                      />
                      {selectedItems && selectedItems.length > 0 && (
                        <div className={styles.tagContainer}>
                          {selectedItems.map((tag, index) => (
                            <Tag
                              key={tag.uuid || tag.id || index}
                              type="blue"
                              onClose={() => {
                                const updatedTags = selectedItems.filter((_, i) => i !== index);
                                onChange(updatedTags);
                              }}>
                              {tag.name}
                            </Tag>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                }}
              />
            </ResponsiveWrapper>
          </Stack>
        </div>
        <ButtonSet
          className={classNames({
            [styles.tablet]: isTablet,
            [styles.desktop]: !isTablet,
          })}>
          <Button className={styles.buttonContainer} kind="secondary" onClick={() => closeWorkspace()}>
            {getCoreTranslation('cancel')}
          </Button>
          <Button
            className={styles.button}
            disabled={isSubmitting || !isDirty || !hasLocations}
            kind="primary"
            type="submit">
            {isSubmitting ? (
              <InlineLoading className={styles.spinner} description={t('saving', 'Saving') + '...'} />
            ) : (
              <span>{t('saveAndClose', 'Save & close')}</span>
            )}
          </Button>
        </ButtonSet>
      </Form>
    </Workspace2>
  );
};

export default BedFormWorkspace;
