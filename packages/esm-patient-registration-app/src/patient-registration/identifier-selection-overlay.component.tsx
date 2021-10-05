import React, { useState, useMemo, useCallback } from 'react';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './patient-registration.scss';
import { Close24, ArrowLeft16 } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { RadioButtonGroup, RadioButton, Button, FormGroup } from 'carbon-components-react';
import { IdentifierSource, PatientIdentifierType, PatientIdentifiersMapType } from './patient-registration-types';

interface PatientIdentifierOverlayProps {
  patientIdentifierMap: PatientIdentifiersMapType;
  closeOverlay: () => void;
  addIdentifier: (selectedIdentifierType: PatientIdentifierType, sourceSelected: IdentifierSource) => void;
}

const PatientIdentifierOverlay: React.FC<PatientIdentifierOverlayProps> = ({
  patientIdentifierMap,
  closeOverlay,
  addIdentifier,
}) => {
  const [selectedIdentifierType, setIdentifierType] = useState<PatientIdentifierType>(null);
  const [selectedIdentifierSource, setIdentifierSource] = useState<IdentifierSource>(null);
  const layout = useLayoutType();
  const { t } = useTranslation();

  const patientIdentifierTypes = useMemo(
    () =>
      Object.values(patientIdentifierMap)
        .filter(({ selected }) => !selected)
        .map(({ patientIdentifierType }) => patientIdentifierType),
    [patientIdentifierMap],
  );

  const identifierTypeRadios = useMemo(
    () =>
      patientIdentifierTypes.map((patientIdentifierType) => (
        <RadioButton
          key={patientIdentifierType.uuid}
          id={patientIdentifierType.uuid}
          labelText={patientIdentifierType.name}
          value={patientIdentifierType.uuid}
        />
      )),
    [selectedIdentifierType, patientIdentifierTypes],
  );

  const identifierSourceRadios = useMemo(
    () =>
      selectedIdentifierType?.identifierSources.map((source, ind) => (
        <RadioButton key={ind} labelText={source.name} value={source.uuid} />
      )),
    [selectedIdentifierType],
  );

  const handleIdentifierType = useCallback(
    (identifierFieldUuid) =>
      setIdentifierType(patientIdentifierTypes.find((identifierType) => identifierType.uuid === identifierFieldUuid)),
    [],
  );

  const handleRevert = useCallback(() => setIdentifierType(null), []);

  const handleAddIdentifier = useCallback(() => {
    addIdentifier(selectedIdentifierType, selectedIdentifierSource);
    closeOverlay();
  }, [selectedIdentifierType, selectedIdentifierSource]);

  return (
    <div className={layout === 'tablet' ? styles.fullScreenOverlay : styles.overlay}>
      <div>
        <div className={styles.patientIdentifierOverlayHeader}>
          <h4 className={styles.productiveHeading02}>Add a new ID Number</h4>
          <Button kind="ghost" size="small" onClick={closeOverlay} hasIconOnly>
            <Close24 />
          </Button>
        </div>
        <div className={styles.overlayContent}>
          <p className={styles.bodyLong02}>
            {t('IDInstructions', "Select the type of ID Number you'd like to add for this patient:")}
          </p>
          {selectedIdentifierType && (
            <Button hasIconOnly kind="ghost" size="sm" className={`${styles.revertButton}`} onClick={handleRevert}>
              <ArrowLeft16 />
            </Button>
          )}
          {!selectedIdentifierType ? (
            <RadioButtonGroup
              legendText="Patient identifier types"
              name="patient-identifier-types"
              onChange={handleIdentifierType}
              orientation="vertical"
              valueSelected={null}
              className={styles.space05}>
              {identifierTypeRadios}
            </RadioButtonGroup>
          ) : (
            <RadioButtonGroup
              legendText="Identifier sources"
              name="identifier-sources"
              onChange={(sourceUuid) =>
                setIdentifierSource(
                  selectedIdentifierType?.identifierSources.find((source) => source.uuid === sourceUuid),
                )
              }
              orientation="vertical"
              className={styles.space05}>
              {identifierSourceRadios}
            </RadioButtonGroup>
          )}
          <p>
            {selectedIdentifierType?.name} {selectedIdentifierSource?.name}
          </p>
        </div>
      </div>
      <div className={styles.overlayButtons}>
        <Button kind="primary" onClick={handleAddIdentifier}>
          Add Identifier
        </Button>
        <Button kind="danger" onClick={closeOverlay}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PatientIdentifierOverlay;
