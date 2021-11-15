import React, { useMemo, useCallback, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './identifier-selection.scss';
import { Close24, ArrowLeft24 } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { RadioButtonGroup, RadioButton, Button, Checkbox, Search } from 'carbon-components-react';
import { PatientIdentifierTypesMap } from '../../patient-registration-types';

interface PatientIdentifierOverlayProps {
  patientIdentifierMap: PatientIdentifierTypesMap;
  closeOverlay: () => void;
  setPatientIdentifierMap: Dispatch<SetStateAction<PatientIdentifierTypesMap>>;
}

const PatientIdentifierOverlay: React.FC<PatientIdentifierOverlayProps> = ({
  patientIdentifierMap,
  closeOverlay,
  setPatientIdentifierMap,
}) => {
  const [selectedIdentifierTypes, setIdentifierTypes] = useState<PatientIdentifierTypesMap>(patientIdentifierMap);
  const [error, setError] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>('');
  const layout = useLayoutType();
  const { t } = useTranslation();

  useEffect(() => {
    if (patientIdentifierMap && !selectedIdentifierTypes) {
      setIdentifierTypes(patientIdentifierMap);
    }
  }, [patientIdentifierMap]);

  const handleSearch = useCallback((event) => setSearchString(event?.target?.value), []);

  const patientIdentifierTypes = useMemo(
    () =>
      Object.values(patientIdentifierMap)
        ?.map(({ patientIdentifierType }) => patientIdentifierType)
        ?.filter((identifierType) => identifierType.name.toLowerCase().includes(searchString.toLowerCase())),
    [patientIdentifierMap, searchString],
  );

  const handleChange = useCallback(
    (uuid, selected) =>
      setIdentifierTypes((identifiers) => ({
        ...identifiers,
        [uuid]: {
          ...identifiers[uuid],
          selected,
          selectedSource: null,
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
          selectedSource: patientIdentifierMap[identifierUuid].patientIdentifierType.identifierSources.find(
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
            patientIdentifierType?.identifierSources?.length && (
              <div className={styles.radioGroup}>
                <RadioButtonGroup
                  legendText={t('source', 'Source')}
                  name={`${patientIdentifierType.fieldName}-identifier-sources`}
                  defaultSelected={patientIdentifierMap[patientIdentifierType.uuid]?.selectedSource?.uuid}
                  onChange={(sourceUuid: string) => selectIdentifierSource(patientIdentifierType.uuid, sourceUuid)}
                  orientation="vertical">
                  {patientIdentifierType.identifierSources.map((source, ind) => (
                    <RadioButton
                      key={ind}
                      labelText={source?.name}
                      name={source?.uuid}
                      value={source.uuid}
                      className={styles.radio}
                    />
                  ))}
                </RadioButtonGroup>
                {error && !selectedIdentifierTypes[patientIdentifierType.uuid].selectedSource && (
                  <span className={`${styles.errorLabel} ${styles.label01}`}>Select a source</span>
                )}
              </div>
            )}
        </div>
      )),
    [selectedIdentifierTypes, patientIdentifierTypes, error],
  );

  const handleAddIdentifier = useCallback(() => {
    if (
      Object.values(selectedIdentifierTypes).some(
        ({ selected, patientIdentifierType, selectedSource }) =>
          selected && patientIdentifierType.identifierSources.length && !selectedSource,
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
    <div className={`${styles.overlay} ${layout === 'tablet' ? styles.fullScreenOverlay : styles.desktopOverlay}`}>
      <div>
        {layout === 'desktop' ? (
          <div className={styles.patientIdentifierOverlayHeaderDesktop}>
            <h4 className={styles.productiveHeading02}>{t('addIDNumber', 'Add a new ID Number')}</h4>
            <Button kind="ghost" iconDescription="" size="small" onClick={closeOverlay} hasIconOnly>
              <Close24 />
            </Button>
          </div>
        ) : (
          <div className={styles.patientIdentifierOverlayHeaderTablet}>
            <Button kind="ghost" iconDescription="" size="small" onClick={closeOverlay} hasIconOnly>
              <ArrowLeft24 />
            </Button>
            <h4 className={styles.productiveHeading02}>{t('addIDNumber', 'Add a new ID Number')}</h4>
          </div>
        )}
        <div className={styles.overlayContent}>
          <p className={styles.bodyLong02}>
            {t('IDInstructions', "Select the type of ID Number you'd like to add for this patient:")}
          </p>
          <div className={styles.space05}>
            <Search
              labelText={t('searchID', 'Search an ID Number')}
              placeholder={t('searchID', 'Search an ID Number')}
              onChange={handleSearch}
              value={searchString}
            />
          </div>
          <fieldset>{identifierTypeCheckboxes}</fieldset>
        </div>
      </div>
      <div className={styles.overlayButtons}>
        <Button kind="secondary" onClick={closeOverlay}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button kind="primary" onClick={handleAddIdentifier}>
          {t('addidentifier', 'Add Identifier')}
        </Button>
      </div>
    </div>
  );
};

export default PatientIdentifierOverlay;
