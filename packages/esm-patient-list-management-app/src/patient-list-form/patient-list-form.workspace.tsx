import React, { useCallback, type SyntheticEvent, useEffect, useId, useMemo, useState } from 'react';
import { Button, ButtonSet, Dropdown, Layer, TextArea, TextInput } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { type TFunction } from 'i18next';
import { z } from 'zod';
import {
  getCoreTranslation,
  OpenmrsFetchError,
  showSnackbar,
  useLayoutType,
  useSession,
  Workspace2,
  type Workspace2DefinitionProps,
} from '@openmrs/esm-framework';
import type { NewCohortData, NewCohortDataPayload, OpenmrsCohort } from '../api/types';
import {
  createPatientList,
  editPatientList,
  extractErrorMessagesFromResponse,
  type ErrorObject,
} from '../api/patient-list.resource';
import { useCohortTypes } from '../api/hooks';
import styles from './patient-list-form.scss';

const createCohortSchema = (t: TFunction) => {
  return z.object({
    name: z
      .string({
        required_error: t('cohortNameRequired', 'Cohort name is required'),
      })
      .trim()
      .min(1, t('cohortNameRequired', 'Cohort name is required')),
    cohortType: z.string().optional(),
    description: z.string().optional(),
  });
};

type CohortFormData = z.infer<ReturnType<typeof createCohortSchema>>;

export interface PatientListFormWorkspaceProps {
  /** Existing patient list to edit. If not provided, creates a new list. */
  patientListDetails?: OpenmrsCohort;
  /** Callback triggered after successful create/edit operation */
  onSuccess?: () => void;
}

const PatientListFormWorkspace: React.FC<Workspace2DefinitionProps<PatientListFormWorkspaceProps>> = ({
  workspaceProps,
  closeWorkspace,
}) => {
  const { patientListDetails, onSuccess = () => {} } = workspaceProps ?? {};
  const id = useId();
  const isTablet = useLayoutType() === 'tablet';
  const responsiveLevel = isTablet ? 1 : 0;
  const session = useSession();
  const { t } = useTranslation();
  const cohortSchema = createCohortSchema(t);
  const { listCohortTypes = [] } =
    useCohortTypes() ?? ({} as { listCohortTypes?: Array<{ uuid: string; display: string }> });
  const { user } = session;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cohortDetails, setCohortDetails] = useState<CohortFormData>({
    name: '',
    description: '',
    cohortType: '',
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const { initialValues, isDirty } = useMemo(() => {
    const initial = {
      name: patientListDetails?.name || '',
      description: patientListDetails?.description || '',
      cohortType: patientListDetails?.cohortType?.uuid || '',
    };
    const dirty =
      cohortDetails.name !== initial.name ||
      cohortDetails.description !== initial.description ||
      cohortDetails.cohortType !== initial.cohortType;
    return { initialValues: initial, isDirty: dirty };
  }, [cohortDetails, patientListDetails]);

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
    if (patientListDetails) {
      setCohortDetails({
        name: patientListDetails?.name || '',
        description: patientListDetails?.description || '',
        cohortType: patientListDetails?.cohortType?.uuid || '',
      });
    } else {
      setCohortDetails({ name: '', description: '', cohortType: '' });
    }
  }, [user, patientListDetails]);

  const handleSubmit = useCallback(() => {
    if (!validateForm(cohortDetails)) {
      return;
    }

    setIsSubmitting(true);

    const onError = (error: unknown) => {
      const errorDescription =
        OpenmrsFetchError && error instanceof OpenmrsFetchError
          ? typeof error.responseBody === 'string'
            ? error.responseBody
            : extractErrorMessagesFromResponse(error.responseBody as ErrorObject, t)
          : (error as any)?.message;

      showSnackbar({
        title: patientListDetails
          ? t('errorUpdatingList', 'Error updating list')
          : t('errorCreatingList', 'Error creating list'),
        subtitle: errorDescription,
        kind: 'error',
      });
      setIsSubmitting(false);
    };

    if (patientListDetails) {
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
          closeWorkspace({ discardUnsavedChanges: true });
        })
        .catch(onError);
    } else {
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
          closeWorkspace({ discardUnsavedChanges: true });
        })
        .catch(onError);
    }
  }, [closeWorkspace, cohortDetails, onSuccess, patientListDetails, session.sessionLocation?.uuid, t, validateForm]);

  const handleChange = useCallback(({ currentTarget }: SyntheticEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCohortDetails((prevDetails) => ({
      ...prevDetails,
      [currentTarget?.name]: currentTarget?.value,
    }));
  }, []);

  const workspaceTitle = patientListDetails
    ? t('editPatientListHeader', 'Edit patient list')
    : t('newPatientListHeader', 'New patient list');

  const handleCancel = useCallback(() => {
    closeWorkspace();
  }, [closeWorkspace]);

  return (
    <Workspace2 title={workspaceTitle} hasUnsavedChanges={isDirty}>
      <div data-tutorial-target="patient-list-form" className={styles.container}>
        {/* data-tutorial-target attribute is essential for joyride in onboarding app ! */}
        <div className={styles.content}>
          <h4 className={styles.header}>{t('configureList', 'Configure your patient list using the fields below')}</h4>
          <div>
            <Layer level={responsiveLevel}>
              <TextInput
                id={`${id}-input`}
                invalid={!!validationErrors.name}
                invalidText={validationErrors.name}
                labelText={t('newPatientListNameLabel', 'List name')}
                name="name"
                onChange={handleChange}
                placeholder={t('listNamePlaceholder', 'e.g. Potential research participants')}
                value={cohortDetails?.name}
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
                enableCounter
                id={`${id}-textarea`}
                labelText={t('newPatientListDescriptionLabel', 'Describe the purpose of this list in a few words')}
                maxCount={255}
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
        </div>
        <ButtonSet className={styles.buttonSet}>
          <Button className={styles.button} onClick={handleCancel} kind="secondary" size="xl">
            {getCoreTranslation('cancel')}
          </Button>
          <Button className={styles.button} onClick={handleSubmit} size="xl" disabled={isSubmitting}>
            {isSubmitting
              ? t('submitting', 'Submitting')
              : patientListDetails
                ? t('editList', 'Edit list')
                : t('createList', 'Create list')}
          </Button>
        </ButtonSet>
      </div>
    </Workspace2>
  );
};

export default PatientListFormWorkspace;
