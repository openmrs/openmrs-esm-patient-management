import React, { useCallback, type SyntheticEvent, useEffect, useId, useState } from 'react';
import { Button, ButtonSet, Dropdown, Layer, TextArea, TextInput } from '@carbon/react';
import { type TFunction, useTranslation } from 'react-i18next';
import { z } from 'zod';
import { OpenmrsFetchError, showSnackbar, useLayoutType, useSession } from '@openmrs/esm-framework';
import type { NewCohortData, NewCohortDataPayload, OpenmrsCohort } from '../api/types';
import {
  createPatientList,
  editPatientList,
  extractErrorMessagesFromResponse,
  type ErrorObject,
} from '../api/api-remote';
import { useCohortTypes } from '../api/hooks';
import Overlay from '../overlay.component';
import styles from './create-edit-patient-list.scss';

const createCohortSchema = (t: TFunction) => {
  return z.object({
    name: z
      .string()
      .min(1, { message: t('cohortNameRequired', 'Cohort name is required') })
      .trim(),
    cohortType: z.string().optional(),
    description: z.string().optional(),
  });
};

type CohortFormData = z.infer<ReturnType<typeof createCohortSchema>>;

interface CreateEditPatientListProps {
  close: () => void;
  isEditing?: boolean;
  patientListDetails?: OpenmrsCohort;
  onSuccess?: () => void;
}

const CreateEditPatientList: React.FC<CreateEditPatientListProps> = ({
  close,
  isEditing = false,
  patientListDetails = null,
  onSuccess = () => {},
}) => {
  const id = useId();
  const isTablet = useLayoutType() === 'tablet';
  const responsiveLevel = isTablet ? 1 : 0;
  const session = useSession();
  const { t } = useTranslation();
  const cohortSchema = createCohortSchema(t);
  const { listCohortTypes } = useCohortTypes() ?? {};
  const { user } = session;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cohortDetails, setCohortDetails] = useState<CohortFormData>({
    name: '',
    description: '',
    cohortType: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback(
    (data: CohortFormData) => {
      try {
        cohortSchema.parse(data);
        setValidationErrors({});
        return true;
      } catch (error) {
        if (error instanceof z.ZodError) {
          setValidationErrors(
            Object.fromEntries(Object.entries(error.flatten().fieldErrors).map(([k, v]) => [k, v[0] ?? ''])),
          );
        }
        return false;
      }
    },
    [cohortSchema],
  );

  useEffect(() => {
    setCohortDetails({
      name: patientListDetails?.name || '',
      description: patientListDetails?.description || '',
      cohortType: patientListDetails?.cohortType?.uuid || '',
    });
  }, [user, patientListDetails]);

  const handleSubmit = useCallback(() => {
    if (!validateForm(cohortDetails)) {
      return;
    }

    setIsSubmitting(true);

    if (isEditing) {
      editPatientList(patientListDetails.uuid, cohortDetails as NewCohortData)
        .then(() => {
          showSnackbar({
            title: t('updated', 'Updated'),
            subtitle: t('listUpdated', 'List updated successfully'),
            kind: 'success',
            isLowContrast: true,
          });

          onSuccess();
          setIsSubmitting(false);
          close();
        })
        .catch((error) => {
          const errorDescription =
            OpenmrsFetchError && error instanceof OpenmrsFetchError
              ? typeof error.responseBody === 'string'
                ? error.responseBody
                : extractErrorMessagesFromResponse(error.responseBody as ErrorObject)
              : error?.message;

          showSnackbar({
            title: t('errorUpdatingList', 'Error updating list'),
            subtitle: errorDescription,
            kind: 'error',
          });
          setIsSubmitting(false);
        });
    }

    if (!isEditing) {
      createPatientList({
        ...cohortDetails,
        location: session?.sessionLocation?.uuid,
      } as NewCohortDataPayload)
        .then(() => {
          showSnackbar({
            title: t('created', 'Created'),
            subtitle: `${t('listCreated', 'List created successfully')}`,
            kind: 'success',
            isLowContrast: true,
          });
          onSuccess();
          setIsSubmitting(false);
          close();
        })
        .catch((error) => {
          const errorDescription =
            OpenmrsFetchError && error instanceof OpenmrsFetchError
              ? typeof error.responseBody === 'string'
                ? error.responseBody
                : extractErrorMessagesFromResponse(error.responseBody as ErrorObject)
              : error?.message;

          showSnackbar({
            title: t('errorCreatingList', 'Error creating list'),
            subtitle: errorDescription,
            kind: 'error',
          });
          setIsSubmitting(false);
        });
    }
  }, [
    close,
    cohortDetails,
    isEditing,
    patientListDetails?.uuid,
    onSuccess,
    session.sessionLocation?.uuid,
    t,
    validateForm,
  ]);

  const handleChange = useCallback(
    ({ currentTarget }: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setCohortDetails((cohortDetails) => ({
        ...cohortDetails,
        [currentTarget?.name]: currentTarget?.value,
      }));
    },
    [setCohortDetails],
  );

  return (
    <Overlay
      buttonsGroup={
        <ButtonSet className={styles.buttonsGroup}>
          <Button className={styles.button} onClick={close} kind="secondary" size="xl">
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSubmit} size="xl" disabled={isSubmitting}>
            {isSubmitting
              ? t('submitting', 'Submitting')
              : isEditing
                ? t('editList', 'Edit list')
                : t('createList', 'Create list')}
          </Button>
        </ButtonSet>
      }
      close={close}
      header={
        isEditing ? t('editPatientListHeader', 'Edit patient list') : t('newPatientListHeader', 'New patient list')
      }>
      <h4 className={styles.header}>{t('configureList', 'Configure your patient list using the fields below')}</h4>
      <div>
        <Layer level={responsiveLevel}>
          <TextInput
            id={`${id}-input`}
            labelText={t('newPatientListNameLabel', 'List name')}
            name="name"
            onChange={handleChange}
            placeholder={t('listNamePlaceholder', 'e.g. Potential research participants')}
            value={cohortDetails?.name}
            invalid={!!validationErrors.name}
            invalidText={validationErrors.name}
          />
        </Layer>
      </div>
      <div className={styles.input}>
        <Layer level={responsiveLevel}>
          <Dropdown
            id="cohortType"
            items={listCohortTypes}
            itemToString={(item) => (item ? item.display : '')}
            label={t('chooseCohortType', 'Choose cohort type')}
            onChange={({ selectedItem }) => {
              setCohortDetails((prev) => ({
                ...prev,
                cohortType: selectedItem?.uuid || '',
              }));
            }}
            selectedItem={listCohortTypes.find((item) => item.uuid === cohortDetails.cohortType) || null}
            titleText={t('selectCohortType', 'Select cohort type')}
            type="default"
          />
        </Layer>
      </div>
      <div className={styles.input}>
        <Layer level={responsiveLevel}>
          <TextArea
            id={`${id}-textarea`}
            labelText={t('newPatientListDescriptionLabel', 'Describe the purpose of this list in a few words')}
            name="description"
            onChange={handleChange}
            placeholder={t(
              'listDescriptionPlaceholder',
              'e.g. Patients with diagnosed asthma who may be willing to be a part of a university research study',
            )}
            value={cohortDetails?.description}
          />
        </Layer>
      </div>
    </Overlay>
  );
};

export default CreateEditPatientList;
