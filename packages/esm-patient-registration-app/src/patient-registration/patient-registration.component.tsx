import React, { useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, InlineLoading, Link } from '@carbon/react';
import { XAxis } from '@carbon/react/icons';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FormProvider, type FieldPath, useForm, useFormContext, useFormState } from 'react-hook-form';
import { isEqual } from 'lodash-es';
import {
  createErrorHandler,
  interpolateUrl,
  showSnackbar,
  useConfig,
  usePatient,
  usePatientPhoto,
} from '@openmrs/esm-framework';
import { builtInSections, type RegistrationConfig, type SectionDefinition } from '../config-schema';
import { cancelRegistration, filterOutUndefinedPatientIdentifiers, scrollIntoView } from './patient-registration-utils';
import { getValidationSchema } from './validation/patient-registration-validation';
import { validateRegistrationForm } from './validation/validate-registration-form';
import { createPatternRuleRegistry, PatternRulesProvider } from './validation/pattern-rules';
import { DummyDataInput } from './input/dummy-data/dummy-data-input.component';
import { useFormHelpers, useRevalidateOnChange, useStableFormValues } from './form-adapter';
import { getLeafPaths, removeUndefinedLeaves } from './form-values-utils';
import { createRegistrationResolver } from './registration-resolver';
import { PatientRegistrationContextProvider } from './patient-registration-context';
import { useResourcesContext } from '../resources-context';
import { SectionWrapper } from './section/section-wrapper.component';
import { type CapturePhotoProps, type FormValues } from './patient-registration.types';
import { type SavePatientForm, SavePatientTransactionManager } from './form-manager';
import { useInitialFormValues, usePatientUuidMap } from './patient-registration-hooks';
import BeforeSavePrompt from './before-save-prompt.component';
import styles from './patient-registration.scss';

let exportedInitialFormValuesForTesting = {} as FormValues;

export interface PatientRegistrationProps {
  savePatientForm: SavePatientForm;
}

export const PatientRegistration: React.FC<PatientRegistrationProps> = ({ savePatientForm }) => {
  const { patientUuid } = useParams();

  return <PatientRegistrationForm key={patientUuid ?? 'new-patient'} savePatientForm={savePatientForm} />;
};

const PatientRegistrationForm: React.FC<PatientRegistrationProps> = ({ savePatientForm }) => {
  const { t } = useTranslation();
  const { patientUuid: uuidOfPatientToEdit } = useParams();
  const { isLoading: isLoadingPatientToEdit, patient: patientToEdit } = usePatient(uuidOfPatientToEdit);
  const config = useConfig<RegistrationConfig>();

  const [initialFormValues, setInitialFormValues] = useInitialFormValues(patientToEdit, uuidOfPatientToEdit);

  const patternRules = useRef(createPatternRuleRegistry()).current;
  const validationSchema = useMemo(
    () => getValidationSchema(config, t, patternRules.getRules),
    [config, t, patternRules],
  );

  const form = useForm<FormValues>({
    defaultValues: initialFormValues,
    resolver: createRegistrationResolver(validationSchema),
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    // Formik does not move the focus on a failed submit.
    shouldFocusError: false,
  });
  const { reset } = form;

  // As Formik's `enableReinitialize`: new initial values reset the values, touched state and errors.
  const previousInitialFormValues = useRef(initialFormValues);
  useEffect(() => {
    if (!isEqual(previousInitialFormValues.current, initialFormValues)) {
      previousInitialFormValues.current = initialFormValues;
      // `keepIsValid` keeps React Hook Form's mounted flag on if a later change reads `formState.isValid`; with the
      // flag off, `getValues` returns the default values and `setValue` events carry no field name. The cost: such a
      // reader sees a stale `isValid` after this reset until the next validation.
      reset(initialFormValues, { keepIsValid: true });
    }
  }, [initialFormValues, reset]);

  useEffect(() => {
    exportedInitialFormValuesForTesting = initialFormValues;
  }, [initialFormValues]);

  return (
    <FormProvider {...form}>
      <PatientRegistrationFormContent
        savePatientForm={savePatientForm}
        uuidOfPatientToEdit={uuidOfPatientToEdit}
        isLoadingPatientToEdit={isLoadingPatientToEdit}
        patientToEdit={patientToEdit}
        initialFormValues={initialFormValues}
        setInitialFormValues={setInitialFormValues}
        patternRules={patternRules}
        validationSchema={validationSchema}
      />
    </FormProvider>
  );
};

interface PatientRegistrationFormContentProps extends PatientRegistrationProps {
  uuidOfPatientToEdit: string | undefined;
  isLoadingPatientToEdit: boolean;
  patientToEdit: ReturnType<typeof usePatient>['patient'];
  initialFormValues: FormValues;
  setInitialFormValues: ReturnType<typeof useInitialFormValues>[1];
  patternRules: ReturnType<typeof createPatternRuleRegistry>;
  validationSchema: ReturnType<typeof getValidationSchema>;
}

const PatientRegistrationFormContent: React.FC<PatientRegistrationFormContentProps> = ({
  savePatientForm,
  uuidOfPatientToEdit,
  isLoadingPatientToEdit,
  patientToEdit,
  initialFormValues,
  setInitialFormValues,
  patternRules,
  validationSchema,
}) => {
  const { t } = useTranslation();
  const { currentSession, identifierTypes } = useResourcesContext();
  const { search } = useLocation();
  const config = useConfig<RegistrationConfig>();
  const { control, getValues, setValue, trigger, handleSubmit, reset } = useFormContext<FormValues>();
  const values = useStableFormValues();
  const { touchedFields, isSubmitting } = useFormState({ control });
  const revalidation = useRevalidateOnChange();
  const { setFieldValue, setFieldTouched } = useFormHelpers();

  const [patientUuidMap] = usePatientUuidMap({}, patientToEdit, uuidOfPatientToEdit);

  const [target, setTarget] = useState<undefined | string>();
  const [capturePhotoProps, setCapturePhotoProps] = useState<CapturePhotoProps | null>(null);

  const location = currentSession?.sessionLocation?.uuid;
  const inEditMode = isLoadingPatientToEdit ? undefined : !!(uuidOfPatientToEdit && patientToEdit);
  const showDummyDataInput = useMemo(
    () => localStorage.getItem('openmrs:devtools') === 'true' && !inEditMode,
    [inEditMode],
  );
  const { data: photo } = usePatientPhoto(patientToEdit?.id);
  const savePatientTransactionManager = useRef(new SavePatientTransactionManager());

  const sections: Array<SectionDefinition> = useMemo(() => {
    return config.sections
      .map(
        (sectionName) =>
          config.sectionDefinitions.filter((s) => s.id === sectionName)[0] ??
          builtInSections.filter((s) => s.id === sectionName)[0],
      )
      .filter((s) => s);
  }, [config.sections, config.sectionDefinitions]);

  const onFormSubmit = async (submittedValues: FormValues) => {
    // React Hook Form keeps an `undefined` value for each field that was touched without a value. Formik left those
    // keys out, and the save treats every `obs` key as an obs to post.
    // Person attributes stay as they are: a saved attribute that loads without a value (for example a concept
    // attribute whose concept is gone) keeps its key, as with Formik, so the save deletes it.
    const values = {
      ...removeUndefinedLeaves(submittedValues),
      ...(submittedValues.attributes && { attributes: submittedValues.attributes }),
    };
    const updatedFormValues = { ...values, identifiers: filterOutUndefinedPatientIdentifiers(values.identifiers) };
    try {
      await savePatientForm(
        !inEditMode,
        updatedFormValues,
        patientUuidMap,
        capturePhotoProps,
        location,
        initialFormValues['identifiers'],
        currentSession,
        config,
        savePatientTransactionManager.current,
      );

      showSnackbar({
        subtitle: inEditMode
          ? t('updatePatientSuccessSnackbarSubtitle', "The patient's information has been successfully updated")
          : t(
              'registerPatientSuccessSnackbarSubtitle',
              'The patient can now be found by searching for them using their name or ID number',
            ),
        title: inEditMode
          ? t('updatePatientSuccessSnackbarTitle', 'Patient Details Updated')
          : t('registerPatientSuccessSnackbarTitle', 'New Patient Created'),
        kind: 'success',
        isLowContrast: true,
      });

      const afterUrl = new URLSearchParams(search).get('afterUrl');
      const redirectUrl = interpolateUrl(afterUrl || config.links.submitButton, { patientUuid: values.patientUuid });

      setTarget(redirectUrl);
    } catch (error) {
      if (error.responseBody?.error?.globalErrors) {
        error.responseBody.error.globalErrors.forEach((error) => {
          showSnackbar({
            title: inEditMode
              ? t('updatePatientErrorSnackbarTitle', 'Patient Details Update Failed')
              : t('registrationErrorSnackbarTitle', 'Patient Registration Failed'),
            subtitle: error.message,
            kind: 'error',
          });
        });
      } else if (error.responseBody?.error?.message) {
        showSnackbar({
          title: inEditMode
            ? t('updatePatientErrorSnackbarTitle', 'Patient Details Update Failed')
            : t('registrationErrorSnackbarTitle', 'Patient Registration Failed'),
          subtitle: error.responseBody.error.message,
          kind: 'error',
        });
      } else {
        createErrorHandler()(error);
      }
    }
  };

  const getDescription = (errors: Record<string, unknown>): React.JSX.Element => {
    return (
      <ul style={{ listStyle: 'inside' }}>
        {Object.keys(errors).map((error, index) => {
          return <li key={index}>{t(`${error}LabelText`, error)}</li>;
        })}
      </ul>
    );
  };

  const displayErrors = (errors: Record<string, unknown>): void => {
    if (errors && typeof errors === 'object' && !!Object.keys(errors).length) {
      showSnackbar({
        isLowContrast: true,
        kind: 'warning',
        title: t('fieldsWithErrors', 'The following fields have errors:'),
        subtitle: <>{getDescription(errors)}</>,
      });
    }
  };

  // As Formik's submit handler: mark every field touched, then validate and save. Native validation can block the
  // submit event; the button's click handler still validates and lists the errors.
  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    revalidation.pause();
    try {
      for (const path of getLeafPaths(getValues())) {
        const fieldPath = path as FieldPath<FormValues>;
        setValue(fieldPath, getValues(fieldPath), { shouldTouch: true });
      }
    } finally {
      revalidation.resume();
    }
    // React Hook Form rethrows errors from the submit handler; Formik logged them.
    return handleSubmit(onFormSubmit)(event).catch((reason) => {
      console.warn('Warning: An unhandled error was caught from submitForm()', reason);
    });
  };

  const setValues = (newValues: FormValues) => {
    // Replaces all values and keeps the rest of the form state, as Formik's `setValues`.
    reset(newValues, {
      keepDefaultValues: true,
      keepTouched: true,
      keepErrors: true,
      keepDirty: true,
      keepIsSubmitted: true,
      keepSubmitCount: true,
    });
    trigger();
  };

  const contextValue = {
    identifierTypes,
    values,
    inEditMode,
    setFieldValue,
    setFieldTouched,
    setCapturePhotoProps,
    currentPhoto: photo?.imageSrc,
    initialFormValues,
    setInitialFormValues,
  };

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <BeforeSavePrompt when={Object.keys(touchedFields).length > 0} redirect={target} />
      <div className={styles.formContainer}>
        {/* Navigation Sidebar */}
        <div className={styles.stickyColumn}>
          <h4>
            {inEditMode ? t('editPatientDetails', 'Edit patient details') : t('createNewPatient', 'Create new patient')}
          </h4>
          {showDummyDataInput && <DummyDataInput setValues={setValues} />}
          <p className={styles.label01}>{t('jumpTo', 'Jump to')}</p>
          {sections.map((section) => (
            <div className={classNames(styles.space05, styles.touchTarget)} key={section.name}>
              <Link className={styles.linkName} onClick={() => scrollIntoView(section.id)}>
                <XAxis size={16} /> {t(`${section.id}Section`, section.name)}
              </Link>
            </div>
          ))}
          <hr className={styles.divider} />
          <Button
            className={styles.submitButton}
            type="submit"
            onClick={async () => {
              await trigger();
              displayErrors(validateRegistrationForm(validationSchema, getValues()));
            }}
            // Current session and identifiers are required for patient registration.
            // If currentSession or identifierTypes are not available, then the
            // user should be blocked to register the patient.
            disabled={!currentSession || !identifierTypes || isSubmitting}>
            {isSubmitting ? (
              <InlineLoading
                className={styles.spinner}
                description={`${t('submitting', 'Submitting')} ...`}
                iconDescription="submitting"
              />
            ) : inEditMode ? (
              t('updatePatient', 'Update patient')
            ) : (
              t('registerPatient', 'Register patient')
            )}
          </Button>
          <Button className={styles.cancelButton} kind="secondary" onClick={cancelRegistration}>
            {t('cancel', 'Cancel')}
          </Button>
        </div>
        {/* Registration Form */}
        <div className={styles.infoGrid}>
          <PatientRegistrationContextProvider value={contextValue}>
            <PatternRulesProvider registry={patternRules}>
              {sections.map((section, index) => (
                <SectionWrapper key={`registration-section-${section.id}`} sectionDefinition={section} index={index} />
              ))}
            </PatternRulesProvider>
          </PatientRegistrationContextProvider>
        </div>
      </div>
    </form>
  );
};

/**
 * @internal
 * Just exported for testing
 */
export { exportedInitialFormValuesForTesting as initialFormValues };
