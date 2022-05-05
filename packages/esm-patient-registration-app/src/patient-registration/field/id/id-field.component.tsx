import React, { useContext, useEffect, useState } from 'react';
import { IdentifierInput } from '../../input/custom-input/identifier/identifier-input.component';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { Button } from 'carbon-components-react';
import { ArrowRight16 } from '@carbon/icons-react';
import { useLayoutType, useConfig } from '@openmrs/esm-framework';
import { PatientIdentifierValue } from '../../patient-registration-types';
import IdentifierSelectionOverlay from './identifier-selection-overlay';
import { FieldArray } from 'formik';
import { ResourcesContext } from '../../../offline.resources';

export const IdField: React.FC = () => {
  const { identifierTypes } = useContext(ResourcesContext);
  const { setFieldValue, inEditMode } = useContext(PatientRegistrationContext);
  const { t } = useTranslation();
  const desktop = useLayoutType() === 'desktop';
  const [showIdentifierOverlay, setShowIdentifierOverlay] = useState(false);
  const config = useConfig();
  const { defaultPatientIdentifierTypes } = config;

  useEffect(() => {
    if (!inEditMode && identifierTypes) {
      const defaultPatientIdentifierTypesMap = {};
      if (defaultPatientIdentifierTypes?.length) {
        defaultPatientIdentifierTypes.forEach((typeUuid) => {
          defaultPatientIdentifierTypesMap[typeUuid] = true;
        });
      }
      setFieldValue(
        'identifiers',
        identifierTypes
          .filter((identifierType) => identifierType.required || defaultPatientIdentifierTypesMap[identifierType.uuid])
          .map(
            (identifierType) =>
              ({
                action: 'ADD',
                identifier: '',
                identifierTypeUuid: identifierType.uuid,
                source: identifierType.identifierSources?.[0],
                preferred: identifierType.isPrimary,
                required: identifierType.required,
              } as PatientIdentifierValue),
          ),
      );
    }
  }, [identifierTypes, inEditMode, defaultPatientIdentifierTypes, setFieldValue]);

  return (
    <div className={styles.halfWidthInDesktopView}>
      <div className={styles.identifierLabelText}>
        <h4 className={styles.productiveHeading02Light}>{t('idFieldLabelText', 'Identifiers')}</h4>
        <Button
          kind="ghost"
          className={styles.setIDNumberButton}
          onClick={() => setShowIdentifierOverlay(true)}
          size={desktop ? 'sm' : 'md'}>
          {t('configure', 'Configure')} <ArrowRight16 />
        </Button>
      </div>
      <div>
        <FieldArray name="identifiers">
          {({
            push,
            remove,
            form: {
              values: { identifiers },
            },
          }) => (
            <>
              {identifiers
                .filter((identifier) => identifier.action !== 'DELETE')
                .map((identifier: PatientIdentifierValue, index) => (
                  <IdentifierInput key={index} index={index} patientIdentifier={identifier} remove={remove} />
                ))}
              {showIdentifierOverlay && (
                <IdentifierSelectionOverlay
                  setFieldValue={setFieldValue}
                  closeOverlay={() => setShowIdentifierOverlay(false)}
                  push={push}
                  identifiers={identifiers}
                  remove={remove}
                />
              )}
            </>
          )}
        </FieldArray>
      </div>
    </div>
  );
};
