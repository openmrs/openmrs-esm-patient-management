import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { Button, InlineLoading, Link, Form } from '@carbon/react';
import { XAxis } from '@carbon/react/icons';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  createErrorHandler,
  interpolateUrl,
  showSnackbar,
  useConfig,
  usePatient,
  usePatientPhoto,
} from '@openmrs/esm-framework';
import { getValidationSchema } from './validation/patient-registration-validation';
import { type CapturePhotoProps, type FormValues } from './patient-registration.types';
import { PatientRegistrationContext } from './patient-registration-context';
import { type SavePatientForm, SavePatientTransactionManager } from './form-manager';
import { DummyDataInput } from './input/dummy-data/dummy-data-input.component';
import { cancelRegistration, filterOutUndefinedPatientIdentifiers, scrollIntoView } from './patient-registration-utils';
import { useInitialAddressFieldValues, useInitialFormValues, usePatientUuidMap } from './patient-registration-hooks';
import { ResourcesContext } from '../offline.resources';
import { builtInSections, type RegistrationConfig, type SectionDefinition } from '../config-schema';
import { SectionWrapper } from './section/section-wrapper.component';
import BeforeSavePrompt from './before-save-prompt';
import styles from './patient-registration.scss';
import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import useZodSchema from './useZodSchema';

let exportedInitialFormValuesForTesting = {} as FormValues;

export interface PatientRegistrationProps {
  savePatientForm: SavePatientForm;
  isOffline: boolean;
}

export const PatientRegistration: React.FC<PatientRegistrationProps> = ({ savePatientForm, isOffline }) => {
  const { currentSession, identifierTypes } = useContext(ResourcesContext);
  const { search } = useLocation();
  const config = useConfig() as RegistrationConfig;
  const [target, setTarget] = useState<undefined | string>();
  const { patientUuid: uuidOfPatientToEdit } = useParams();
  const { isLoading: isLoadingPatientToEdit, patient: patientToEdit } = usePatient(uuidOfPatientToEdit);
  const { t } = useTranslation();
  const [capturePhotoProps, setCapturePhotoProps] = useState<CapturePhotoProps | null>(null);
  const [initialFormValues, setInitialFormValues] = useInitialFormValues(uuidOfPatientToEdit);
  const [initialAddressFieldValues] = useInitialAddressFieldValues(uuidOfPatientToEdit);
  const [patientUuidMap] = usePatientUuidMap(uuidOfPatientToEdit);
  const location = currentSession?.sessionLocation?.uuid;
  const inEditMode = isLoadingPatientToEdit ? undefined : !!(uuidOfPatientToEdit && patientToEdit);
  const showDummyData = useMemo(() => localStorage.getItem('openmrs:devtools') === 'true' && !inEditMode, [inEditMode]);
  const { data: photo } = usePatientPhoto(patientToEdit?.id);
  const savePatientTransactionManager = useRef(new SavePatientTransactionManager());
  const fieldDefinition = config?.fieldDefinitions?.filter((def) => def.type === 'address');
  const validationSchema = getValidationSchema(config);

  useEffect(() => {
    exportedInitialFormValuesForTesting = initialFormValues;
  }, [initialFormValues]);

  const sections: Array<SectionDefinition> = useMemo(() => {
    return config.sections
      .map(
        (sectionName) =>
          config.sectionDefinitions.filter((s) => s.id == sectionName)[0] ??
          builtInSections.filter((s) => s.id == sectionName)[0],
      )
      .filter((s) => s);
  }, [config.sections, config.sectionDefinitions]);

  const zodSchema = useZodSchema();

  const methods = useForm<FormValues>({
    defaultValues: initialFormValues,
    resolver: zodResolver(zodSchema),
  });

  const {
    control,
    handleSubmit,
    formState: { isDirty, isSubmitting, defaultValues },
    setValue,
    getValues,
    reset,
  } = methods;

  useEffect(() => {
    reset(initialFormValues, {
      keepDirtyValues: true,
    });
  }, [initialFormValues]);

  const onFormSubmit = async (values: FormValues) => {
    const abortController = new AbortController();
    // helpers.setSubmitting(true);
    const updatedFormValues = { ...values, identifiers: filterOutUndefinedPatientIdentifiers(values.identifiers) };
    try {
      await savePatientForm(
        !inEditMode,
        updatedFormValues,
        patientUuidMap,
        initialAddressFieldValues,
        capturePhotoProps,
        location,
        initialFormValues['identifiers'],
        currentSession,
        config,
        savePatientTransactionManager.current,
        abortController,
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

      // helpers.setSubmitting(false);
    }
  };

  const getDescription = (errors) => {
    return (
      <ul style={{ listStyle: 'inside' }}>
        {Object.keys(errors).map((error, index) => {
          return <li key={index}>{t(`${error}LabelText`, error)}</li>;
        })}
      </ul>
    );
  };

  const displayErrors = (errors) => {
    if (errors && typeof errors === 'object' && !!Object.keys(errors).length) {
      showSnackbar({
        isLowContrast: true,
        kind: 'warning',
        title: t('fieldsWithErrors', 'The following fields have errors:'),
        subtitle: <>{getDescription(errors)}</>,
      });
    }
  };

  return (
    <Form className={styles.form} onSubmit={handleSubmit(onFormSubmit, displayErrors)}>
      <BeforeSavePrompt when={isDirty} redirect={target} />
      <div className={styles.formContainer}>
        <div>
          <div className={styles.stickyColumn}>
            <h4>
              {inEditMode
                ? t('editPatientDetails', 'Edit patient details')
                : t('createNewPatient', 'Create new patient')}
            </h4>
            {showDummyData && <DummyDataInput setValues={() => {}} />}
            <p className={styles.label01}>{t('jumpTo', 'Jump to')}</p>
            {sections.map((section) => (
              <div className={classNames(styles.space05, styles.touchTarget)} key={section.name}>
                <Link className={styles.linkName} onClick={() => scrollIntoView(section.id)}>
                  <XAxis size={16} /> {t(`${section.id}Section`, section.name)}
                </Link>
              </div>
            ))}
            <Button
              className={styles.submitButton}
              type="submit"
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
            <Button className={styles.cancelButton} kind="tertiary" onClick={cancelRegistration}>
              {t('cancel', 'Cancel')}
            </Button>
          </div>
        </div>
        <div className={styles.infoGrid}>
          <PatientRegistrationContext.Provider
            value={{
              ...methods,
              identifierTypes: identifierTypes,
              validationSchema,
              // values: props.values,
              inEditMode,
              // setFieldValue: props.setFieldValue,
              // setFieldTouched: props.setFieldTouched,
              setCapturePhotoProps,
              currentPhoto: photo?.imageSrc,
              isOffline,
              // initialFormValues: defaultValues,
              // setInitialFormValues,
            }}>
            {sections.map((section, index) => (
              <SectionWrapper key={`registration-section-${section.id}`} sectionDefinition={section} index={index} />
            ))}
          </PatientRegistrationContext.Provider>
        </div>
      </div>
    </Form>
  );
};

/**
 * @internal
 * Just exported for testing
 */
export { exportedInitialFormValuesForTesting as initialFormValues };
