import React, { useState, useEffect, useContext, useMemo, useRef } from 'react';
import { Button, Link } from '@carbon/react';
import { XAxis } from '@carbon/react/icons';
import { Router, useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Formik, Form, FormikHelpers } from 'formik';
import { createErrorHandler, showToast, useConfig, interpolateUrl, usePatient } from '@openmrs/esm-framework';
import { validationSchema as initialSchema } from './validation/patient-registration-validation';
import { FormValues, CapturePhotoProps, PatientIdentifierValue } from './patient-registration-types';
import { PatientRegistrationContext } from './patient-registration-context';
import { SavePatientForm, SavePatientTransactionManager } from './form-manager';
import { usePatientPhoto } from './patient-registration.resource';
import { DummyDataInput } from './input/dummy-data/dummy-data-input.component';
import {
  cancelRegistration,
  filterUndefinedPatientIdenfier,
  parseAddressTemplateXml,
  scrollIntoView,
} from './patient-registration-utils';
import { useInitialAddressFieldValues, useInitialFormValues, usePatientUuidMap } from './patient-registration-hooks';
import { ResourcesContext } from '../offline.resources';
import { builtInSections, RegistrationConfig, SectionDefinition } from '../config-schema';
import { SectionWrapper } from './section/section-wrapper.component';
import BeforeSavePrompt from './before-save-prompt';
import styles from './patient-registration.scss';

let exportedInitialFormValuesForTesting = {} as FormValues;

export interface PatientRegistrationProps {
  savePatientForm: SavePatientForm;
  isOffline: boolean;
}

export const PatientRegistration: React.FC<PatientRegistrationProps> = ({ savePatientForm, isOffline }) => {
  const { currentSession, addressTemplate, identifierTypes } = useContext(ResourcesContext);
  const { search } = useLocation();
  const config = useConfig() as RegistrationConfig;
  const [target, setTarget] = useState<undefined | string>();
  const [validationSchema, setValidationSchema] = useState(initialSchema);
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

  useEffect(() => {
    if (addressTemplate) {
      const addressTemplateXml = addressTemplate?.results[0].value;
      if (!addressTemplateXml) {
        return;
      }
      const { addressValidationSchema } = parseAddressTemplateXml(addressTemplateXml);
      setValidationSchema((validationSchema) => validationSchema.concat(addressValidationSchema));
    }
  }, [inEditMode, addressTemplate, initialAddressFieldValues]);

  const onFormSubmit = async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    const abortController = new AbortController();
    helpers.setSubmitting(true);

    const updatedFormValues = { ...values, identifiers: filterUndefinedPatientIdenfier(values.identifiers) };
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

      showToast({
        description: inEditMode
          ? t('updationSuccessToastDescription', "The patient's information has been successfully updated")
          : t(
              'registrationSuccessToastDescription',
              'The patient can now be found by searching for them using their name or ID number',
            ),
        title: inEditMode
          ? t('updationSuccessToastTitle', 'Patient Details Updated')
          : t('registrationSuccessToastTitle', 'New Patient Created'),
        kind: 'success',
      });

      const afterUrl = new URLSearchParams(search).get('afterUrl');
      const redirectUrl = interpolateUrl(afterUrl || config.links.submitButton, { patientUuid: values.patientUuid });

      setTarget(redirectUrl);
    } catch (error) {
      if (error.responseBody?.error?.globalErrors) {
        error.responseBody.error.globalErrors.forEach((error) => {
          showToast({ description: error.message });
        });
      } else if (error.responseBody?.error?.message) {
        showToast({ description: error.responseBody.error.message });
      } else {
        createErrorHandler()(error);
      }

      helpers.setSubmitting(false);
    }
  };

  const getDescription = (errors) => {
    return (
      <div>
        <p>{t('fieldErrorTitleMessage', 'The following fields have errors:')}</p>
        <ul style={{ listStyle: 'inside' }}>
          {Object.keys(errors).map((error, index) => (
            <li key={index}>{t(`${error}LabelText`, error)}</li>
          ))}
        </ul>
      </div>
    );
  };

  const displayErrors = (errors) => {
    if (errors && typeof errors === 'object' && !!Object.keys(errors).length) {
      showToast({
        description: getDescription(errors),
        title: t('incompleteForm', 'Incomplete form'),
        kind: 'warning',
      });
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={initialFormValues}
      validationSchema={validationSchema}
      onSubmit={onFormSubmit}>
      {(props) => (
        <Form className={styles.form}>
          <BeforeSavePrompt when={props.dirty} redirect={target} />
          <div className={styles.formContainer}>
            <div>
              <div className={styles.stickyColumn}>
                <h4>
                  {inEditMode ? t('edit', 'Edit') : t('createNew', 'Create New')} {t('patient', 'Patient')}
                </h4>
                {showDummyData && <DummyDataInput setValues={props.setValues} />}
                <p className={styles.label01}>{t('jumpTo', 'Jump to')}</p>
                {sections.map((section) => (
                  <div className={`${styles.space05} ${styles.touchTarget}`} key={section.name}>
                    <Link className={styles.linkName} onClick={() => scrollIntoView(section.id)}>
                      <XAxis size={16} /> {t(`${section.id}Section`, section.name)}
                    </Link>
                  </div>
                ))}
                <Button
                  className={styles.submitButton}
                  type="submit"
                  onClick={() => props.validateForm().then((errors) => displayErrors(errors))}
                  // Current session and identifiers are required for patient registration.
                  // If currentSession or identifierTypes are not available, then the
                  // user should be blocked to register the patient.
                  disabled={!currentSession || !identifierTypes}>
                  {inEditMode ? t('updatePatient', 'Update Patient') : t('registerPatient', 'Register Patient')}
                </Button>
                <Button className={styles.cancelButton} kind="tertiary" onClick={cancelRegistration}>
                  {t('cancel', 'Cancel')}
                </Button>
              </div>
            </div>
            <div className={styles.infoGrid}>
              <PatientRegistrationContext.Provider
                value={{
                  identifierTypes: identifierTypes,
                  validationSchema,
                  setValidationSchema,
                  values: props.values,
                  inEditMode,
                  setFieldValue: props.setFieldValue,
                  setCapturePhotoProps,
                  currentPhoto: photo?.imageSrc,
                  isOffline,
                  initialFormValues: props.initialValues,
                  setInitialFormValues,
                }}>
                {sections.map((section, index) => (
                  <SectionWrapper
                    key={`registration-section-${section.id}`}
                    sectionDefinition={section}
                    index={index}
                  />
                ))}
              </PatientRegistrationContext.Provider>
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
