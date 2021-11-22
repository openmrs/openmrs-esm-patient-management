import React, { useState, useEffect, useContext, useMemo } from 'react';
import XAxis16 from '@carbon/icons-react/es/x-axis/16';
import { Button, Grid, Link } from 'carbon-components-react';
import BeforeSavePrompt from './before-save-prompt';
import styles from './patient-registration.scss';
import { useLocation } from 'react-router-dom';
import { Formik, Form, FormikHelpers } from 'formik';
import {
  createErrorHandler,
  showToast,
  useCurrentPatient,
  useConfig,
  interpolateString,
  interpolateUrl,
} from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { validationSchema as initialSchema } from './validation/patient-registration-validation';
import { FormValues, CapturePhotoProps, CustomPatientIdentifierType } from './patient-registration-types';
import { PatientRegistrationContext } from './patient-registration-context';
import { SavePatientForm } from './form-manager';
import { fetchPatientPhotoUrl } from './patient-registration.resource';
import { DummyDataInput } from './input/dummy-data/dummy-data-input.component';
import { getSection } from './section/section-helper';
import { cancelRegistration, parseAddressTemplateXml, scrollIntoView } from './patient-registration-utils';
import { useInitialAddressFieldValues, useInitialFormValues, usePatientUuidMap } from './patient-registration-hooks';
import { ResourcesContext } from '../offline.resources';
import IdentifierSelectionOverlay from './ui-components/identifier-selection-overlay/identifier-selection-overlay';
import camelCase from 'lodash-es/camelCase';

let exportedInitialFormValuesForTesting = {} as FormValues;

export interface PatientRegistrationProps {
  savePatientForm: SavePatientForm;
  match: any;
}

export const PatientRegistration: React.FC<PatientRegistrationProps> = ({ savePatientForm, match }) => {
  const { currentSession, addressTemplate, patientIdentifiers } = useContext(ResourcesContext);
  const { search } = useLocation();
  const config = useConfig();
  const { patientUuid } = match.params;
  const [sections, setSections] = useState([]);
  const [target, setTarget] = useState<undefined | string>();
  const [validationSchema, setValidationSchema] = useState(initialSchema);
  const [loading, patient] = useCurrentPatient(patientUuid);
  const { t } = useTranslation();
  const [capturePhotoProps, setCapturePhotoProps] = useState<CapturePhotoProps>(null);
  const [fieldConfigs, setFieldConfigs] = useState({});
  const [initialFormValues, setInitialFormValues] = useInitialFormValues(patientUuid);
  const [initialAddressFieldValues] = useInitialAddressFieldValues(patientUuid);
  const [patientUuidMap] = usePatientUuidMap(patientUuid);
  const location = currentSession.sessionLocation?.uuid;
  const inEditMode = loading ? undefined : !!(patientUuid && patient);
  const showDummyData = useMemo(() => localStorage.getItem('openmrs:devtools') === 'true' && !inEditMode, [inEditMode]);
  const [showIdentifierOverlay, setIdentifierOverlay] = useState<boolean>(false);
  const [customPatientIdentifiers, setCustomPatientIdentifiers] = useState<CustomPatientIdentifierType[]>([]);

  useEffect(() => {
    exportedInitialFormValuesForTesting = initialFormValues;
  }, [initialFormValues]);

  useEffect(() => {
    if (config?.sections) {
      const configuredSections = config.sections.map((section) => ({
        id: section,
        name: config.sectionDefinitions[section].name,
        fields: config.sectionDefinitions[section].fields,
      }));

      setSections(configuredSections);
      setFieldConfigs(config.fieldConfigurations);
    }
  }, [config.sections, config.fieldConfigurations, config.sectionDefinitions]);

  useEffect(() => {
    for (const patientIdentifier of patientIdentifiers) {
      if (!initialFormValues[patientIdentifier.fieldName]) {
        setInitialFormValues({ ...initialFormValues, [patientIdentifier.fieldName]: '' });
      }

      setInitialFormValues({
        ...initialFormValues,
        ['source-for-' + patientIdentifier.fieldName]:
          patientIdentifier.identifierSources.length > 0 ? patientIdentifier.identifierSources[0].name : '',
      });
    }
  }, [patientIdentifiers]);

  useEffect(() => {
    const addressTemplateXml = addressTemplate.results[0].value;

    if (!addressTemplateXml) {
      return;
    }

    const { addressFieldValues, addressValidationSchema } = parseAddressTemplateXml(addressTemplateXml);
    setValidationSchema((validationSchema) => validationSchema.concat(addressValidationSchema));

    // `=== false` is here on purpose (`inEditMode` is a triple state value).
    // We *only* want to set initial address field values when *creating* a patient.
    // We must wait until after loading for this info.
    if (inEditMode === false) {
      for (const { name, defaultValue } of addressFieldValues) {
        if (!initialAddressFieldValues[name]) {
          initialAddressFieldValues[name] = defaultValue;
        }
      }

      setInitialFormValues({ ...initialFormValues, ...initialAddressFieldValues });
    }
  }, [inEditMode, addressTemplate]);

  useEffect(() => {
    if (patient) {
      const abortController = new AbortController();

      fetchPatientPhotoUrl(patient.id, config.concepts.patientPhotoUuid, abortController).then(setCapturePhotoProps);

      return () => abortController.abort();
    }
  }, [patient, config]);

  useEffect(() => {
    if (patientIdentifiers) {
      setCustomPatientIdentifiers(
        patientIdentifiers?.map((identifier) => ({
          ...identifier,
          selected: identifier?.isPrimary,
          selectedSource: identifier?.identifierSources?.length > 0 ? identifier?.identifierSources[0] : null,
          defaultSelected:
            inEditMode && initialFormValues
              ? initialFormValues?.identifiers[camelCase(identifier.name)]
                ? true
                : false
              : false,
        })),
      );
    }
  }, [patientIdentifiers, inEditMode, initialFormValues]);

  const onFormSubmit = async (values: FormValues, helpers: FormikHelpers<FormValues>) => {
    const abortController = new AbortController();
    helpers.setSubmitting(true);
    try {
      const createdPatientUuid = await savePatientForm(
        patientUuid,
        values,
        patientUuidMap,
        initialAddressFieldValues,
        customPatientIdentifiers.filter((identifier) => identifier?.selected),
        capturePhotoProps,
        config?.concepts?.patientPhotoUuid,
        location,
        config?.personAttributeSections,
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

      if (createdPatientUuid) {
        const redirectUrl = interpolateUrl(
          new URLSearchParams(search).get('afterUrl') ||
            interpolateString(config.links.submitButton, { patientUuid: createdPatientUuid }),
        );

        setTarget(redirectUrl);
      }
    } catch (error) {
      if (error.responseBody && error.responseBody.error.globalErrors) {
        error.responseBody.error.globalErrors.forEach((error) => {
          showToast({ description: error.message });
        });
      } else if (error.responseBody && error.responseBody.error.message) {
        showToast({ description: error.responseBody.error.message });
      } else {
        createErrorHandler()(error);
      }

      helpers.setSubmitting(false);
    }
  };

  return (
    <>
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
                        <XAxis16 /> {section.name}
                      </Link>
                    </div>
                  ))}
                  <Button className={styles.submitButton} type="submit">
                    {inEditMode ? t('updatePatient', 'Update Patient') : t('registerPatient', 'Register Patient')}
                  </Button>
                  <Button className={styles.cancelButton} kind="tertiary" onClick={cancelRegistration}>
                    {t('cancel', 'Cancel')}
                  </Button>
                </div>
              </div>
              <Grid className={styles.infoGrid}>
                <PatientRegistrationContext.Provider
                  value={{
                    identifierTypes: customPatientIdentifiers.filter((identifier) => identifier?.selected),
                    validationSchema,
                    setValidationSchema,
                    fieldConfigs,
                    values: props.values,
                    inEditMode,
                    setFieldValue: props.setFieldValue,
                    setCapturePhotoProps,
                    currentPhoto: capturePhotoProps?.imageData,
                    showPatientIdentifierOverlay: () => setIdentifierOverlay(true),
                    setPatientIdentifiers: setCustomPatientIdentifiers,
                  }}>
                  {sections.map((section, index) => (
                    <div key={index}>{getSection(section, index)}</div>
                  ))}
                </PatientRegistrationContext.Provider>
              </Grid>
            </div>
          </Form>
        )}
      </Formik>
      {showIdentifierOverlay && (
        <IdentifierSelectionOverlay
          closeOverlay={() => setIdentifierOverlay(false)}
          patientIdentifiers={customPatientIdentifiers}
          setPatientIdentifiers={setCustomPatientIdentifiers}
        />
      )}
    </>
  );
};

/**
 * @internal
 * Just exported for testing
 */
export { exportedInitialFormValuesForTesting as initialFormValues };
