import React, { useMemo, useCallback, SetStateAction, Dispatch } from 'react';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './patient-registration.scss';
import { Close24 } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { RadioButtonGroup, RadioButton, Button, Checkbox } from 'carbon-components-react';
import { IdentifierSource, PatientIdentifiersMapType, PatientUuidMapType } from './patient-registration-types';

interface PatientIdentifierOverlayProps {
  patientIdentifierMap: PatientIdentifiersMapType;
  closeOverlay: () => void;
  setPatientIdentifiersMap: Dispatch<SetStateAction<PatientUuidMapType>>;
}

const PatientIdentifierOverlay: React.FC<PatientIdentifierOverlayProps> = ({
  patientIdentifierMap,
  closeOverlay,
  setPatientIdentifiersMap,
}) => {
  const layout = useLayoutType();
  const { t } = useTranslation();

  const patientIdentifierTypes = useMemo(
    () =>
      Object.values(patientIdentifierMap)
        // .filter(({ selected }) => !selected)
        ?.map(({ patientIdentifierType }) => patientIdentifierType),
    [patientIdentifierMap],
  );

  const handleChange = useCallback(
    (uuid) =>
      setPatientIdentifiersMap((identifiers) => ({
        ...identifiers,
        [uuid]: {
          ...identifiers[uuid],
          selected: identifiers[uuid].patientIdentifierType.isPrimary ? true : !identifiers[uuid].selected,
          sourceSelected: null,
        },
      })),
    [],
  );

  const selectIdentifierSource = useCallback(
    (identifierUuid: string, identifierSourceUuid: string) =>
      setPatientIdentifiersMap((identifiers) => ({
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
        <>
          <Checkbox
            id={patientIdentifierType.uuid}
            value={patientIdentifierType.uuid}
            labelText={patientIdentifierType.name}
            onChange={() => handleChange(patientIdentifierType.uuid)}
            checked={patientIdentifierMap[patientIdentifierType.uuid].selected}
            disabled={patientIdentifierType.isPrimary}
          />
          {patientIdentifierMap[patientIdentifierType.uuid]?.selected && (
            <RadioButtonGroup
              legendText={`Select ${patientIdentifierType.name}'s sources`}
              name="identifier-sources"
              onChange={(sourceUuid: string) => selectIdentifierSource(patientIdentifierType.uuid, sourceUuid)}
              orientation="vertical"
              className={styles.radioGroup}>
              {patientIdentifierType.identifierSources.map((source, ind) => (
                <RadioButton key={ind} labelText={source?.name} value={source.uuid} />
              ))}
            </RadioButtonGroup>
          )}
        </>
      )),
    [patientIdentifierMap, patientIdentifierTypes],
  );

  const handleAddIdentifier = useCallback(() => {
    closeOverlay();
  }, [patientIdentifierMap]);

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
          <fieldset className={styles.space05}>{identifierTypeCheckboxes}</fieldset>
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
