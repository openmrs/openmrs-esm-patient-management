import React, { useState, useMemo } from 'react';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './patient-registration.scss';
import { Close24 } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { RadioButtonGroup, RadioButton, Button } from 'carbon-components-react';
import { IdentifierSource, PatientIdentifierType, CustomPatientIdentifierType } from './patient-registration-types';

interface PatientIdentifierOverlayProps {
  patientIdentifierTypes: CustomPatientIdentifierType[];
  closeOverlay: () => void;
}

const PatientIdentifierOverlay: React.FC<PatientIdentifierOverlayProps> = ({
  patientIdentifierTypes,
  closeOverlay,
}) => {
  const [selectedIdentifierType, setIdentifierType] = useState<PatientIdentifierType>(null);
  const [selectedIdentifierSource, setIdentifierSource] = useState<IdentifierSource>(null);
  const layout = useLayoutType();
  const { t } = useTranslation();

  const identifierTypeRadios = patientIdentifierTypes?.map((identifierType) => (
    <RadioButton key={identifierType.uuid} labelText={identifierType.name} value={identifierType.uuid} />
  ));

  const identifierSourceRadios = selectedIdentifierType?.identifierSources.map((source, ind) => (
    <RadioButton key={ind} labelText={source.name} value={source.uuid} />
  ));

  return (
    <div className={layout === 'phone' ? styles.fullScreenOverlay : styles.overlay}>
      <div>
        <div className={styles.patientIdentifierOverlayHeader}>
          <h4 className={styles.productiveHeading02}>Add a new ID Number</h4>
          <Button kind="ghost" size="small" onClick={closeOverlay}>
            <Close24 />
          </Button>
        </div>
        <div className={styles.overlayContent}>
          <p className={styles.bodyLong02}>
            {t('IDInstructions', "Select the type of ID Number you'd like to add for this patient:")}
          </p>
          {!selectedIdentifierType ? (
            <RadioButtonGroup
              name="patient-identifier-types"
              onChange={(identifierFieldUuid: string) =>
                setIdentifierType(
                  patientIdentifierTypes.find((identifierType) => identifierType.uuid === identifierFieldUuid),
                )
              }
              orientation="vertical"
              className={styles.radioButtonGroup}>
              {identifierTypeRadios}
            </RadioButtonGroup>
          ) : (
            <RadioButtonGroup
              name="patient-identifier-sources"
              onChange={(identifierSourceUuid: string) =>
                setIdentifierSource(
                  selectedIdentifierType.identifierSources.find((source) => source.uuid === identifierSourceUuid),
                )
              }
              orientation="vertical"
              className={styles.radioButtonGroup}>
              {identifierSourceRadios}
            </RadioButtonGroup>
          )}
          <p>
            {selectedIdentifierType?.name} {selectedIdentifierSource?.name}
          </p>
        </div>
      </div>
      <div className={styles.overlayButtons}>
        <Button kind="primary">Add Identifier</Button>
        <Button kind="danger" onClick={closeOverlay}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PatientIdentifierOverlay;
