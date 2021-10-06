import React, { useMemo, useCallback, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './patient-registration.scss';
import { Close24 } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { RadioButtonGroup, RadioButton, Button, Checkbox } from 'carbon-components-react';
import { PatientIdentifiersMapType, PatientUuidMapType } from './patient-registration-types';

interface PatientIdentifierOverlayProps {
  patientIdentifierMap: PatientIdentifiersMapType;
  closeOverlay: () => void;
  setPatientIdentifierMap: Dispatch<SetStateAction<PatientUuidMapType>>;
}

const PatientIdentifierOverlay: React.FC<PatientIdentifierOverlayProps> = ({
  patientIdentifierMap,
  closeOverlay,
  setPatientIdentifierMap,
}) => {
  const [selectedIdentifierTypes, setIdentifierTypes] = useState<PatientUuidMapType>(patientIdentifierMap);
  const [error, setError] = useState<boolean>(false);
  const layout = useLayoutType();
  const { t } = useTranslation();

  useEffect(() => {
    if (patientIdentifierMap && !selectedIdentifierTypes) {
      setIdentifierTypes(patientIdentifierMap);
    }
  }, [patientIdentifierMap]);

  const patientIdentifierTypes = useMemo(
    () =>
      Object.values(patientIdentifierMap)
        // .filter(({ selected }) => !selected)
        ?.map(({ patientIdentifierType }) => patientIdentifierType),
    [patientIdentifierMap],
  );

  const handleChange = useCallback(
    (uuid, selected) =>
      setIdentifierTypes((identifiers) => ({
        ...identifiers,
        [uuid]: {
          ...identifiers[uuid],
          selected,
          sourceSelected: null,
        },
      })),
    [],
  );

  const selectIdentifierSource = useCallback(
    (identifierUuid: string, identifierSourceUuid: string) =>
      setIdentifierTypes((identifiers) => ({
        ...identifiers,
        [identifierUuid]: {
          ...identifiers[identifierUuid],
          sourceSelected: patientIdentifierMap[identifierUuid].patientIdentifierType.identifierSources.find(
            (source) => source.uuid === identifierSourceUuid,
          ),
        },
      })),
    [],
  );

  const identifierTypeCheckboxes = useMemo(
    () =>
      patientIdentifierTypes.map((patientIdentifierType) => (
        <div key={patientIdentifierType.uuid} className={styles.space05}>
          <Checkbox
            id={patientIdentifierType.uuid}
            value={patientIdentifierType.uuid}
            labelText={patientIdentifierType.name}
            onChange={(selected) => handleChange(patientIdentifierType.uuid, selected)}
            checked={selectedIdentifierTypes[patientIdentifierType.uuid].selected}
            disabled={patientIdentifierType.isPrimary}
          />
          {selectedIdentifierTypes[patientIdentifierType.uuid]?.selected &&
            (patientIdentifierType?.identifierSources?.length ? (
              <div className={styles.radioGroup}>
                <RadioButtonGroup
                  legendText={`Select ${patientIdentifierType.name}'s sources`}
                  name={`${patientIdentifierType.fieldName}-identifier-sources`}
                  defaultSelected={patientIdentifierMap[patientIdentifierType.uuid]?.sourceSelected?.uuid}
                  onChange={(sourceUuid: string) => selectIdentifierSource(patientIdentifierType.uuid, sourceUuid)}
                  orientation="vertical">
                  {patientIdentifierType.identifierSources.map((source, ind) => (
                    <RadioButton key={ind} labelText={source?.name} name={source?.uuid} value={source.uuid} />
                  ))}
                </RadioButtonGroup>
                {error && !selectedIdentifierTypes[patientIdentifierType.uuid].sourceSelected && (
                  <span className={`${styles.errorLabel} ${styles.label01}`}>Select a source</span>
                )}
              </div>
            ) : (
              <span className={`${styles.label01} ${styles.radioGroup}`}>No identifier sources found</span>
            ))}
        </div>
      )),
    [selectedIdentifierTypes, patientIdentifierTypes, error],
  );

  const handleAddIdentifier = useCallback(() => {
    if (
      Object.values(selectedIdentifierTypes).some(
        ({ selected, patientIdentifierType, sourceSelected }) =>
          selected && patientIdentifierType.identifierSources.length && !sourceSelected,
      )
    ) {
      setError(true);
      return;
    }
    setError(false);
    setPatientIdentifierMap((identifierMap) => ({
      ...identifierMap,
      ...selectedIdentifierTypes,
    }));
    closeOverlay();
  }, [selectedIdentifierTypes]);

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
          <fieldset>{identifierTypeCheckboxes}</fieldset>
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
