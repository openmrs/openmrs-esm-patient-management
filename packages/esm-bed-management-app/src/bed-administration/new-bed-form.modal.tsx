import {
  Button,
  ComboBox,
  Form,
  FormGroup,
  InlineLoading,
  InlineNotification,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Select,
  SelectItem,
  Stack,
  TextArea,
  TextInput,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { getCoreTranslation, showSnackbar } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import React, { useCallback, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { z } from 'zod';
import { useLocationsWithAdmissionTag } from '../summary/summary.resource';
import { type BedFormData } from '../types';
import { type BedAdministrationData } from './bed-administration-types';
import { saveBed, useBedType } from './bed-administration.resource';
import styles from './new-bed-form.scss';

interface NewBedFormProps {
  mutate: () => void;
  closeModal: () => void;
}

const numberInString = z.string().transform((val, ctx) => {
  const parsed = parseInt(val);
  if (isNaN(parsed) || parsed < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      // TODO: Translate this message
      message: 'Please enter a valid number',
    });
    return z.NEVER;
  }
  return val;
});

const BedAdministrationSchema = z.object({
  bedColumn: numberInString,
  bedId: z.string().max(255),
  bedRow: numberInString,
  bedType: z.string().refine((value) => value != '', 'Please select a valid bed type'),
  description: z.string().max(255),
  location: z
    .object({ display: z.string(), uuid: z.string() })
    .refine((value) => value.display != '', 'Please select a valid location'),
  occupancyStatus: z.string().refine((value) => value != '', 'Please select a valid occupied status'),
});

interface ErrorType {
  message: string;
}

const NewBedForm: React.FC<NewBedFormProps> = ({ closeModal, mutate }) => {
  const { t } = useTranslation();
  const { admissionLocations } = useLocationsWithAdmissionTag();
  const { bedTypes } = useBedType();
  const occupancyStatuses = ['Available', 'Occupied'];
  const availableBedTypes = bedTypes ? bedTypes : [];
  const [showErrorNotification, setShowErrorNotification] = useState(false);
  const [formStateError, setFormStateError] = useState('');
  const [{ isErrored, isSubmitting, isSuccessful, description }, setSubmissionStatus] = useState<{
    isSubmitting: boolean;
    isSuccessful: boolean | undefined;
    isErrored: boolean | undefined;
    description: string | undefined;
  }>({
    isSubmitting: false,
    isSuccessful: false,
    isErrored: undefined,
    description: undefined,
  });

  const initialData: BedFormData = {
    bedNumber: '',
    bedType: null,
    column: 0,
    description: '',
    id: 0,
    location: {
      display: '',
      uuid: '',
    },
    row: 0,
    status: null,
    uuid: '',
  };

  const [occupancyStatus, setOccupancyStatus] = useState(capitalize(initialData.status));

  const handleCreateBed = useCallback(
    (formData: BedAdministrationData) => {
      const { bedId, description, occupancyStatus, bedRow, bedColumn, location, bedType } = formData;

      const bedObject = {
        bedNumber: bedId,
        bedType,
        description,
        status: occupancyStatus.toUpperCase(),
        row: parseInt(bedRow.toString()),
        column: parseInt(bedColumn.toString()),
        locationUuid: location.uuid,
      };

      setSubmissionStatus({
        isErrored: false,
        isSuccessful: undefined,
        isSubmitting: true,
        description: 'Submitting...',
      });
      saveBed({ bedPayload: bedObject })
        .then(() => {
          showSnackbar({
            title: t('newBedCreated', 'New bed created'),
            kind: 'success',
            subtitle: `Bed ${bedId} created successfully`,
          });

          mutate();

          setSubmissionStatus({
            isSubmitting: false,
            isSuccessful: true,
            isErrored: false,
            description: 'Saved',
          });
        })
        .catch((error) => {
          showSnackbar({
            title: t('errorCreatingForm', 'Error creating bed'),
            kind: 'error',
            subtitle: error?.message,
          });
          setSubmissionStatus({
            isSubmitting: false,
            isSuccessful: false,
            isErrored: true,
            description: 'errorred',
          });
        })
        .finally(() => {
          closeModal();
        });
    },
    [mutate, t],
  );

  const {
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<BedAdministrationData>({
    mode: 'all',
    resolver: zodResolver(BedAdministrationSchema),
    defaultValues: {
      bedColumn: initialData.column.toString() ?? '0',
      bedId: initialData.bedNumber ?? '',
      bedRow: initialData.row.toString() ?? '0',
      bedType: initialData.bedType?.name ?? '',
      description: initialData.bedType?.description ?? '',
      location: initialData.location ?? {},
      occupancyStatus: capitalize(initialData.status) ?? occupancyStatus,
    },
  });

  const onSubmit = (formData: BedAdministrationData) => {
    const result = BedAdministrationSchema.safeParse(formData);
    if (result.success) {
      setShowErrorNotification(false);
      handleCreateBed(formData);
    }
  };

  const onError = (error: { [key: string]: ErrorType }) => {
    setFormStateError(Object.entries(error)[0][1].message);
    setShowErrorNotification(true);
  };

  return (
    <React.Fragment>
      <ModalHeader closeModal={closeModal} title={t('createNewBed', 'Create a new bed')} />
      <ModalBody hasScrollingContent>
        <Form>
          <Stack gap={3}>
            <FormGroup legendText={''}>
              <Controller
                name="bedId"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <TextInput
                      id="bedId"
                      invalidText={fieldState.error?.message}
                      labelText={t('bedNumber', 'Bed number')}
                      placeholder={t('enterBedNumber', 'e.g. BMW-201')}
                      {...field}
                    />
                  </>
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="description"
                control={control}
                render={({ field, fieldState }) => (
                  <>
                    <TextArea
                      id="description"
                      invalidText={fieldState?.error?.message}
                      labelText={t('bedDescription', 'Bed description')}
                      placeholder={t('enterBedDescription', 'Enter the bed description')}
                      rows={2}
                      {...field}
                    />
                  </>
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="bedRow"
                control={control}
                render={({ fieldState, field }) => (
                  <NumberInput
                    hideSteppers
                    id="bedRow"
                    invalidText={fieldState?.error?.message}
                    label="Bed row"
                    labelText="Bed row"
                    {...field}
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="bedColumn"
                control={control}
                render={({ field, fieldState }) => (
                  <NumberInput
                    hideSteppers
                    id="bedColumn"
                    label="Bed column"
                    labelText="Bed column"
                    invalidText={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="location"
                control={control}
                render={({ fieldState, field: { onChange, onBlur, value, ref } }) => (
                  <ComboBox
                    aria-label={t('location', 'Location')}
                    id="location"
                    invalidText={fieldState?.error?.message}
                    items={admissionLocations}
                    itemToString={(location) => location?.display ?? ''}
                    label={t('location', 'Location')}
                    onBlur={onBlur}
                    onChange={({ selectedItem }) => onChange(selectedItem)}
                    placeholder={t('selectBedLocation', 'Select a bed location')}
                    ref={ref}
                    selectedItem={value}
                    titleText={t('bedLocation', 'Location')}
                    typeahead
                  />
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="occupancyStatus"
                control={control}
                render={({ field, fieldState }) => (
                  <Select
                    defaultValue={occupancyStatus}
                    id="occupancyStatus"
                    invalidText={fieldState.error?.message}
                    labelText={t('occupancyStatus', 'Occupancy status')}
                    onChange={(event) => setOccupancyStatus(event.target.value)}
                    value={occupancyStatus}
                    {...field}>
                    <SelectItem text={t('chooseOccupiedStatus', 'Choose occupied status')} value="" />
                    {occupancyStatuses.map((occupancyStatus, index) => (
                      <SelectItem
                        key={`occupancyStatus-${index}`}
                        text={t('occupancyStatus', `${occupancyStatus}`)}
                        value={t('occupancyStatus', `${occupancyStatus}`)}
                      />
                    ))}
                  </Select>
                )}
              />
            </FormGroup>

            <FormGroup>
              <Controller
                name="bedType"
                control={control}
                render={({ field }) => (
                  <Select
                    defaultValue={initialData.bedType?.name}
                    id="bedType"
                    invalidText={t('required', 'Required')}
                    labelText={t('bedType', 'Bed type')}
                    {...field}>
                    <SelectItem text={t('chooseBedtype', 'Choose a bed type')} />
                    {availableBedTypes.map((bedType, index) => (
                      <SelectItem text={bedType.name} value={bedType.name} key={`bedType-${index}`}>
                        {bedType.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </FormGroup>
            {showErrorNotification && (
              <InlineNotification
                kind="error"
                lowContrast
                onClose={() => setShowErrorNotification(false)}
                role="alert"
                style={{ minWidth: '100%', margin: '0', padding: '0' }}
                subtitle={t('pleaseFillField', formStateError) + '.'}
                title={t('error', 'Error')}
              />
            )}
          </Stack>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button onClick={() => closeModal} kind="secondary">
          {getCoreTranslation('cancel', 'Cancel')}
        </Button>
        {isSubmitting || isErrored || isSuccessful ? (
          <Button>
            <InlineLoading
              status={isSubmitting ? 'active' : isErrored ? 'error' : isSuccessful ? 'finished' : 'inactive'}
              description={description}
              className={styles.inlineLoading}
            />
          </Button>
        ) : (
          <Button disabled={!isDirty} onClick={handleSubmit(onSubmit, onError)}>
            {t('save', 'save')}
          </Button>
        )}
      </ModalFooter>
    </React.Fragment>
  );
};

export default NewBedForm;
