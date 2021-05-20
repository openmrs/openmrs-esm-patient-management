import React, { useState, useEffect, useCallback, useContext } from 'react';
import XAxis16 from '@carbon/icons-react/es/x-axis/16';
import styles from './patient-registration.scss';
import camelCase from 'lodash-es/camelCase';
import capitalize from 'lodash-es/capitalize';
import Button from 'carbon-components-react/es/components/Button';
import Link from 'carbon-components-react/es/components/Link';
import { useLocation, useHistory } from 'react-router-dom';
import { Formik, Form } from 'formik';
import { Grid, Row, Column } from 'carbon-components-react/es/components/Grid';
import { validationSchema as initialSchema } from './validation/patient-registration-validation';
import { PatientIdentifierType, FormValues, CapturePhotoProps, PatientUuidMapType } from './patient-registration-types';
import { PatientRegistrationContext } from './patient-registration-context';
import FormManager, { SavePatientForm } from './form-manager';
import BeforeSavePrompt from './before-save-prompt';
import { fetchPatientPhotoUrl } from './patient-registration.resource';
import {
  createErrorHandler,
  showToast,
  useCurrentPatient,
  useConfig,
  navigate,
  interpolateString,
} from '@openmrs/esm-framework';
import { DummyDataInput } from './input/dummy-data/dummy-data-input.component';
import { useTranslation } from 'react-i18next';
import { getSection } from './section/section-helper';
import { cancelRegistration, parseAddressTemplateXml, scrollIntoView } from './patient-registration-utils';
import { ResourcesContext } from '../offline.resources';

const initialAddressFieldValues = {};

const patientUuidMap: PatientUuidMapType = {
  additionalNameUuid: undefined,
  patientUuid: undefined,
  preferredNameUuid: undefined,
};

const blankFormValues: FormValues = {
  givenName: '',
  middleName: '',
  familyName: '',
  unidentifiedPatient: false,
  additionalGivenName: '',
  additionalMiddleName: '',
  additionalFamilyName: '',
  addNameInLocalLanguage: false,
  gender: '',
  birthdate: null,
  yearsEstimated: 0,
  monthsEstimated: 0,
  birthdateEstimated: false,
  telephoneNumber: '',
  address1: '',
  address2: '',
  cityVillage: '',
  stateProvince: '',
  country: '',
  postalCode: '',
  isDead: false,
  deathDate: '',
  deathCause: '',
  relationships: [{ relatedPerson: '', relationship: '' }],
};

// If a patient is fetched, this will be updated with their information
const initialFormValues: FormValues = { ...blankFormValues };
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
  const location = currentSession.sessionLocation?.uuid;
  const inEditMode = !!(patientUuid && patient);
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
  const onRequestClose = useCallback(() => {
    setModalOpen(false);
    // add the route blocked when
    window.addEventListener('single-spa:before-routing-event', cancelNavFn);
  }, []);
  const onRequestSubmit = useCallback(() => {
    history.push(`/${getUrlWithoutPrefix(newUrl)}`);
  }, [newUrl]);

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
    if (!inEditMode) {
      Object.assign(initialFormValues, blankFormValues);
    } else {
      patientUuidMap['patientUuid'] = patient.id;

      // set names
      if (patient.name.length) {
        let name = patient.name[0];
        patientUuidMap['preferredNameUuid'] = name.id;
        initialFormValues.givenName = name.given[0];
        initialFormValues.middleName = name.given[1];
        initialFormValues.familyName = name.family;
        if (name.given[0] === 'UNKNOWN' && name.family === 'UNKNOWN') {
          initialFormValues.unidentifiedPatient = true;
        }
        if (patient.name.length > 1) {
          name = patient.name[1];
          patientUuidMap['additionalNameUuid'] = name.id;
          initialFormValues.addNameInLocalLanguage = true;
          initialFormValues.additionalGivenName = name.given[0];
          initialFormValues.additionalMiddleName = name.given[1];
          initialFormValues.additionalFamilyName = name.family;
        }
      }

      initialFormValues.gender = capitalize(patient.gender);
      initialFormValues.birthdate = patient.birthDate;
      initialFormValues.telephoneNumber = patient.telecom ? patient.telecom[0].value : '';

      patient.identifier.forEach((id) => {
        const key = camelCase(id.system || id.type.text);
        patientUuidMap[key] = {
          uuid: id.id,
          value: id.value,
        };
        initialFormValues[key] = id.value;
      });

      if (patient.address && patient.address[0]) {
        const address = patient.address[0];
        Object.keys(address).forEach((prop) => {
          switch (prop) {
            case 'id':
              patientUuidMap['preferredAddressUuid'] = address[prop];
              break;
            case 'city':
              initialAddressFieldValues['cityVillage'] = address[prop];
              break;
            case 'state':
              initialAddressFieldValues['stateProvince'] = address[prop];
              break;
            case 'district':
              initialAddressFieldValues['countyDistrict'] = address[prop];
              break;
            case 'extension':
              address[prop].forEach((ext) => {
                ext.extension.forEach((extension) => {
                  initialAddressFieldValues[extension.url.split('#')[1]] = extension.valueString;
                });
              });
              break;
            default:
              if (prop === 'country' || prop === 'postalCode') {
                initialAddressFieldValues[prop] = address[prop];
              }
          }
        });
      }

      if (patient.deceasedBoolean || patient.deceasedDateTime) {
        initialFormValues.isDead = true;
        initialFormValues.deathDate = patient.deceasedDateTime ? patient.deceasedDateTime.split('T')[0] : '';
      }

      const abortController = new AbortController();
      fetchPatientPhotoUrl(patient.id, config.concepts.patientPhotoUuid, abortController).then((value) =>
        setCurrentPhoto(value),
      ); // TODO: Edit mode

      return () => abortController.abort();
    }
  }, [inEditMode]);

  useEffect(() => {
    for (const patientIdentifier of patientIdentifiers) {
      if (!initialFormValues[patientIdentifier.fieldName]) {
        initialFormValues[patientIdentifier.fieldName] = '';
      }

      initialFormValues['source-for-' + patientIdentifier.fieldName] =
        patientIdentifier.identifierSources.length > 0 ? patientIdentifier.identifierSources[0].name : '';
    }
  }, [patientIdentifiers]);

  useEffect(() => {
    if (capturePhotoProps?.base64EncodedImage || capturePhotoProps?.imageFile) {
      setCurrentPhoto(capturePhotoProps.base64EncodedImage || URL.createObjectURL(capturePhotoProps.imageFile));
    }
  }, [capturePhotoProps]);

  useEffect(() => {
    const addressTemplateXml = addressTemplate.results[0].value;
    if (!addressTemplateXml) {
      return;
    }

    const { addressFieldValues, addressValidationSchema } = parseAddressTemplateXml(addressTemplateXml);

    for (const { name, defaultValue } of addressFieldValues) {
      if (!initialAddressFieldValues[name]) {
        initialAddressFieldValues[name] = defaultValue;
      }
    }

    setValidationSchema((validationSchema) => validationSchema.concat(addressValidationSchema));
    Object.assign(initialFormValues, initialAddressFieldValues);
  }, [addressTemplate]);

  const onFormSubmit = async (values: FormValues) => {
    const abortController = new AbortController();

    try {
      const patientUuid = await savePatientForm(
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
          new URLSearchParams(search).get('afterUrl') || interpolateString(config.links.submitButton, { patientUuid });
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
                <Column lg={2} md={2} sm={1}>
                  <div className={styles.fixedPosition}>
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
                </Column>
                <Column lg={10} md={6}>
                  <Grid>
                    <PatientRegistrationContext.Provider
                      value={{
                        identifierTypes: patientIdentifiers,
                        validationSchema,
                        setValidationSchema,
                        fieldConfigs,
                        values: props.values,
                        inEditMode,
                        setFieldValue: props.setFieldValue,
                      }}>
                      {sections.map((section, index) => (
                        <div key={index}>{getSection(section, index, setCapturePhotoProps, currentPhoto)}</div>
                      ))}
                    </PatientRegistrationContext.Provider>
                  </Grid>
                </Column>
              </Row>
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
export { initialFormValues };
