import React, { useContext, useEffect, useState } from 'react';
import { IdentifierInput } from '../../input/custom-input/identifier/identifier-input.component';
import styles from '../field.scss';
import { useTranslation } from 'react-i18next';
import { PatientRegistrationContext } from '../../patient-registration-context';
import { Button } from 'carbon-components-react';
import { ArrowRight16 } from '@carbon/icons-react';
import { useLayoutType } from '@openmrs/esm-framework';
import { PatientIdentifierValueType } from '../../patient-registration-types';
import IdentifierSelectionOverlay from '../../ui-components/identifier-selection-overlay';
import { FieldArray, useField } from 'formik';
import { ResourcesContext } from '../../../offline.resources';

export const IdField: React.FC = () => {
  const { patientIdentifiers } = useContext(ResourcesContext);
  const { setFieldValue, inEditMode, values } = useContext(PatientRegistrationContext);
  const { t } = useTranslation();
  const desktop = useLayoutType() === 'desktop';
  const [showIdentifierOverlay, setIdentifierOverlay] = useState<boolean>(false);

  useEffect(() => {
    if (!inEditMode) {
      const identifiers = patientIdentifiers.filter((identifier) => identifier.isPrimary);
      setFieldValue(
        'identifiers',
        identifiers.map(
          (identifier) =>
            ({
              name: identifier.name,
              fieldName: identifier.fieldName,
              action: 'ADD',
              value: '',
              source: identifier.identifierSources.length > 0 ? identifier.identifierSources[0] : null,
              isPrimary: identifier.isPrimary,
            } as PatientIdentifierValueType),
        ),
      );
    }
  }, [patientIdentifiers, inEditMode]);

  return (
    <div>
      <div className={styles.identifierLabelText}>
        <h4 className={styles.productiveHeading02Light}>{t('idFieldLabelText', 'Identifiers')}</h4>
        <Button
          kind="ghost"
          className={styles.setIDNumberButton}
          onClick={() => setIdentifierOverlay(true)}
          size={desktop ? 'sm' : 'md'}>
          {t('configure', 'Configure')} <ArrowRight16 />
        </Button>
      </div>
      <div className={styles.grid}>
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
                .map((identifier: PatientIdentifierValueType, index) => (
                  <IdentifierInput key={index} index={index} identifier={identifier} remove={remove} />
                ))}
              {showIdentifierOverlay && (
                <IdentifierSelectionOverlay
                  setFieldValue={setFieldValue}
                  closeOverlay={() => setIdentifierOverlay(false)}
                  patientIdentifiers={patientIdentifiers}
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
