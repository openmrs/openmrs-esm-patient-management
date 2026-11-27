import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { cloneDeep, isEqual, set } from 'lodash-es';
import { Button, InlineLoading, Link } from '@carbon/react';
import { XAxis } from '@carbon/react/icons';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Form, Formik, type FormikHelpers, type FormikErrors } from 'formik';
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
  const { currentSession, identifierTypes } = useResourcesContext();
  const { patientUuid: uuidOfPatientToEdit } = useParams();
  const { search } = useLocation();
  const { isLoading: isLoadingPatientToEdit, patient: patientToEdit } = usePatient(uuidOfPatientToEdit);
  const config = useConfig<RegistrationConfig>();

  const [initialFormValues, setInitialFormValues] = useInitialFormValues(patientToEdit, uuidOfPatientToEdit);

  const [patientUuidMap] = usePatientUuidMap({}, patientToEdit, uuidOfPatientToEdit);

  const [target, setTarget] = useState<undefined | string>();
  const [capturePhotoProps, setCapturePhotoProps] = useState<CapturePhotoProps | null>(null);

  // Tracks the form's baseline values (including mount-time defaults applied by child sections)
  // so BeforeSavePrompt only arms when the user actually changes data, not on focus/blur alone.
  const baselineValuesRef = useRef<FormValues>(cloneDeep(initialFormValues));
  const previousInitialValuesRef = useRef<FormValues>(initialFormValues);
  if (!isEqual(previousInitialValuesRef.current, initialFormValues)) {
    previousInitialValuesRef.current = initialFormValues;
    baselineValuesRef.current = cloneDeep(initialFormValues);
  }

  const recordInitialFieldValue = useCallback((field: string, value: unknown) => {
    set(baselineValuesRef.current, field, cloneDeep(value));
  }, []);

  const location = currentSession?.sessionLocation?.uuid;
  const inEditMode = isLoadingPatientToEdit ? undefined : !!(uuidOfPatientToEdit && patientToEdit);
  const showDummyDataInput = useMemo(
    () => localStorage.getItem('openmrs:devtools') === 'true' && !inEditMode,
    [inEditMode],
  );
  const { data: photo } = usePatientPhoto(patientToEdit?.id);
  const savePatientTransactionManager = useRef(new SavePatientTransactionManager());
  const patternRules = useRef(createPatternRuleRegistry()).current;
  const validationSchema = useMemo(
    () => getValidationSchema(config, t, patternRules.getRules),
    [config, t, patternRules],
  );

  useEffect(() => {
    exportedInitialFormValuesForTesting = initialFormValues;
  }, [initialFormValues]);

  const sections: Array<SectionDefinition> = useMemo(() => {
    return config.sections
      .map(
        (sectionName) =>
          config.sectionDefinitions.filter((s) => s.id === sectionName)[0] ??
          builtInSections.filter((s) => s.id === sectionName)[0],
      )
      .filter((s) => s);
  }, [config.sections, config.sectionDefinitions]);

  const onFormSubmit = async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    helpers.setSubmitting(true);

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

      helpers.setSubmitting(false);
    }
  };

  const getDescription = (errors: FormikErrors<FormValues>): React.JSX.Element => {
    return (
      <ul style={{ listStyle: 'inside' }}>
        {Object.keys(errors).map((error, index) => {
          return <li key={index}>{t(`${error}LabelText`, error)}</li>;
        })}
      </ul>
    );
  };

  const displayErrors = (errors: FormikErrors<FormValues>): void => {
    if (errors && typeof errors === 'object' && !!Object.keys(errors).length) {
      showSnackbar({
        isLowContrast: true,
        kind: 'warning',
        title: t('fieldsWithErrors', 'The following fields have errors:'),
        subtitle: <>{getDescription(errors)}</>,
      });
    }
  };

  const createContextValue = useCallback(
    (formikProps) => ({
      identifierTypes,
      values: formikProps.values,
      inEditMode,
      setFieldValue: formikProps.setFieldValue,
      setFieldTouched: formikProps.setFieldTouched,
      setCapturePhotoProps,
      currentPhoto: photo?.imageSrc,
      initialFormValues: formikProps.initialValues,
      setInitialFormValues,
      recordInitialFieldValue,
    }),
    [identifierTypes, inEditMode, setCapturePhotoProps, photo?.imageSrc, setInitialFormValues, recordInitialFieldValue],
  );

  return (
    <Formik
      enableReinitialize
      initialValues={initialFormValues}
      onSubmit={onFormSubmit}
      validate={(values) => validateRegistrationForm(validationSchema, values)}>
      {(props) => (
        <Form className={styles.form}>
          <BeforeSavePrompt
            when={!isEqual(baselineValuesRef.current, props.values) || Boolean(capturePhotoProps)}
            redirect={target}
          />
          <div className={styles.formContainer}>
            {/* Navigation Sidebar */}
            <div className={styles.stickyColumn}>
              <h4>
                {inEditMode
                  ? t('editPatientDetails', 'Edit patient details')
                  : t('createNewPatient', 'Create new patient')}
              </h4>
              {showDummyDataInput && <DummyDataInput setValues={props.setValues} />}
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
                onClick={() => props.validateForm().then((errors) => displayErrors(errors))}
                // Current session and identifiers are required for patient registration.
                // If currentSession or identifierTypes are not available, then the
                // user should be blocked to register the patient.
                disabled={!currentSession || !identifierTypes || props.isSubmitting}>
                {props.isSubmitting ? (
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
              <PatientRegistrationContextProvider value={createContextValue(props)}>
                <PatternRulesProvider registry={patternRules}>
                  {sections.map((section, index) => (
                    <SectionWrapper
                      key={`registration-section-${section.id}`}
                      sectionDefinition={section}
                      index={index}
                    />
                  ))}
                </PatternRulesProvider>
              </PatientRegistrationContextProvider>
            </div>
          </div>
        </Form>
      )}
    </Formik>
  );
};

/**
 * @internal
 * Just exported for testing
 */
export { exportedInitialFormValuesForTesting as initialFormValues };
