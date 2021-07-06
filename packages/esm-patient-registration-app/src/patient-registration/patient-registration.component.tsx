import React, { useState, useEffect, useCallback, useContext } from 'react';
import XAxis16 from '@carbon/icons-react/es/x-axis/16';
import styles from './patient-registration.scss';
import Button from 'carbon-components-react/es/components/Button';
import Link from 'carbon-components-react/es/components/Link';
import { useLocation, useHistory } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { Grid, Row, Column } from 'carbon-components-react/es/components/Grid';
import { validationSchema as initialSchema } from './validation/patient-registration-validation';
import { FormValues, CapturePhotoProps } from './patient-registration-types';
import { PatientRegistrationContext } from './patient-registration-context';
import { SavePatientForm } from './form-manager';
import BeforeSavePrompt from './before-save-prompt';
import { fetchPatientPhotoUrl } from './patient-registration.resource';
import {
  createErrorHandler,
  showToast,
  useCurrentPatient,
  useConfig,
  navigate,
  interpolateString,
  ExtensionSlot,
  Extension,
} from '@openmrs/esm-framework';
import { DummyDataInput } from './input/dummy-data/dummy-data-input.component';
import { useTranslation } from 'react-i18next';
import { getSection } from './section/section-helper';
import { cancelRegistration, parseAddressTemplateXml, scrollIntoView } from './patient-registration-utils';
import { ResourcesContext } from '../offline.resources';
import { useInitialAddressFieldValues, useInitialFormValues, usePatientUuidMap } from './patient-registration-hooks';

let exportedInitialFormValuesForTesting = {} as FormValues;
const getUrlWithoutPrefix = (url) => url.split(window['getOpenmrsSpaBase']())?.[1];

export interface PatientRegistrationProps {
  savePatientForm: SavePatientForm;
  match: any;
}

export const PatientRegistration: React.FC<PatientRegistrationProps> = ({ savePatientForm, match }) => {
  const { currentSession, addressTemplate, patientIdentifiers } = useContext(ResourcesContext);
  const { search } = useLocation();
  const config = useConfig();
  const { patientUuid } = match.params;
  const history = useHistory();
  const [open, setModalOpen] = useState(false);
  const [newUrl, setNewUrl] = useState(undefined);
  const [sections, setSections] = useState([]);
  const [validationSchema, setValidationSchema] = useState(initialSchema);
  const [loading, patient] = useCurrentPatient(patientUuid);
  const { t } = useTranslation();
  const [capturePhotoProps, setCapturePhotoProps] = useState<CapturePhotoProps>(null);
  const [fieldConfigs, setFieldConfigs] = useState({});
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [initialFormValues, setInitialFormValues] = useInitialFormValues(patientUuid);
  const [initialAddressFieldValues] = useInitialAddressFieldValues(patientUuid);
  const [patientUuidMap] = usePatientUuidMap(patientUuid);
  const location = currentSession.sessionLocation?.uuid;
  const inEditMode = loading ? undefined : !!(patientUuid && patient);
  const cancelNavFn = useCallback(
    (evt: CustomEvent) => {
      if (!open && !evt.detail.navigationIsCanceled) {
        evt.detail.cancelNavigation();
        setNewUrl(evt.detail.newUrl);
        setModalOpen(true);

        // once the listener is run, we want to remove it immediately in case an infinite loop occurs due
        // to constant redirects
        evt.target.removeEventListener('single-spa:before-routing-event', cancelNavFn);
      }
    },
    [open],
  );

  useEffect(() => {
    exportedInitialFormValuesForTesting = initialFormValues;
  }, [initialFormValues]);

  const onRequestClose = useCallback(() => {
    setModalOpen(false);
    // add the route blocked when
    window.addEventListener('single-spa:before-routing-event', cancelNavFn);
  }, [cancelNavFn]);

  const onRequestSubmit = useCallback(() => history.push(`/${getUrlWithoutPrefix(newUrl)}`), [history, newUrl]);

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
  }, [t, config]);

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
    if (capturePhotoProps?.base64EncodedImage || capturePhotoProps?.imageFile) {
      setCurrentPhoto(capturePhotoProps.base64EncodedImage || URL.createObjectURL(capturePhotoProps.imageFile));
    }
  }, [capturePhotoProps]);

  useEffect(() => {
    if (patient) {
      const abortController = new AbortController();
      fetchPatientPhotoUrl(patient.id, config.concepts.patientPhotoUuid, abortController).then((value) =>
        setCurrentPhoto(value),
      );

      return () => abortController.abort();
    }
  }, [patient, config]);

  const onFormSubmit = async (values: FormValues) => {
    const abortController = new AbortController();

    try {
      const createdPatientUuid = await savePatientForm(
        patientUuid,
        values,
        patientUuidMap,
        initialAddressFieldValues,
        patientIdentifiers,
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

      if (patientUuid) {
        const redirectUrl =
          new URLSearchParams(search).get('afterUrl') ||
          interpolateString(config.links.submitButton, { createdPatientUuid });
        window.removeEventListener('single-spa:before-routing-event', cancelNavFn);
        navigate({ to: redirectUrl });
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
    }
  };

  return (
    <main className="omrs-main-content" style={{ backgroundColor: 'white' }}>
      <Formik
        enableReinitialize
        initialValues={initialFormValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting }) => {
          onFormSubmit(values);
          setSubmitting(false);
        }}>
        {(props) => (
          <Form className={styles.form}>
            <BeforeSavePrompt
              {...{
                when: props.dirty,
                open,
                newUrl,
                cancelNavFn,
                onRequestClose,
                onRequestSubmit,
              }}
            />
            <Grid>
              <Row>
                <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
              </Row>
              <div className={styles.formContainer}>
                <div>
                  <div className={styles.stickyColumn}>
                    <h4>
                      {inEditMode ? t('edit', 'Edit') : t('createNew', 'Create New')} {t('patient', 'Patient')}
                    </h4>
                    {localStorage.getItem('openmrs:devtools') === 'true' && !inEditMode && (
                      <DummyDataInput setValues={props.setValues} />
                    )}
                    <p className={styles.label01}>{t('jumpTo', 'Jump to')}</p>
                    {sections.map((section) => (
                      <div className={`${styles.space05} ${styles.TouchTarget}`} key={section.name}>
                        <Link className={styles.LinkName} onClick={() => scrollIntoView(section.id)}>
                          <XAxis16 /> {section.name}
                        </Link>
                      </div>
                    ))}
                    <Button style={{ marginBottom: '1rem', width: '11.688rem', display: 'block' }} type="submit">
                      {inEditMode ? t('updatePatient', 'Update Patient') : t('registerPatient', 'Register Patient')}
                    </Button>
                    <Button style={{ width: '11.688rem' }} kind="tertiary" onClick={cancelRegistration}>
                      {t('cancel', 'Cancel')}
                    </Button>
                  </div>
                </div>
                <div>
                  <Grid style={{ marginBottom: '40vh' }}>
                    <PatientRegistrationContext.Provider
                      value={{
                        identifierTypes: patientIdentifiers,
                        validationSchema,
                        setValidationSchema,
                        fieldConfigs,
                        values: props.values,
                        inEditMode,
                        setFieldValue: props.setFieldValue,
                        setCapturePhotoProps,
                        currentPhoto,
                      }}>
                      {sections.map((section, index) => (
                        <div key={index}>{getSection(section, index)}</div>
                      ))}
                    </PatientRegistrationContext.Provider>
                  </Grid>
                </div>
              </div>
            </Grid>
          </Form>
        )}
      </Formik>
    </main>
  );
};

/**
 * @internal
 * Just exported for testing
 */
export { exportedInitialFormValuesForTesting as initialFormValues };
