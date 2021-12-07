import React, { useMemo, useCallback, useEffect, useState, Dispatch, SetStateAction } from 'react';
import styles from './identifier-selection.scss';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Search, RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { PatientIdentifierType } from '../../patient-registration-types';
import Overlay from '../overlay/overlay.component';

interface PatientIdentifierOverlayProps {
  patientIdentifiers: PatientIdentifierType[];
  closeOverlay: () => void;
  setPatientIdentifiers: Dispatch<SetStateAction<PatientIdentifierType[]>>;
}

const PatientIdentifierOverlay: React.FC<PatientIdentifierOverlayProps> = ({
  patientIdentifiers,
  closeOverlay,
  setPatientIdentifiers,
}) => {
  const [identifierTypes, setIdentifierTypes] = useState<PatientIdentifierType[]>([]);
  const [searchString, setSearchString] = useState<string>('');
  const { t } = useTranslation();

  useEffect(() => {
    if (patientIdentifiers) {
      setIdentifierTypes(patientIdentifiers);
    }
  }, [patientIdentifiers]);

  const handleSearch = useCallback((event) => setSearchString(event?.target?.value), []);

  const filteredIdentifiers = useMemo(
    () => identifierTypes?.filter((identifier) => identifier?.name?.toLowerCase().includes(searchString.toLowerCase())),
    [identifierTypes, searchString],
  );

  const handleCheckingIdentifier = useCallback((uuid: string, selected: boolean) => {
    setIdentifierTypes((identifiers) =>
      identifiers.map((identifier) =>
        identifier.uuid === uuid
          ? {
              ...identifier,
              selected,
            }
          : identifier,
      ),
    );
  }, []);

  const handleSelectingIdentifierSource = useCallback((patientIdentifierUuid, sourceUuid) => {
    setIdentifierTypes((identifiers) =>
      identifiers?.map((identifier) =>
        identifier?.uuid === patientIdentifierUuid
          ? {
              ...identifier,
              selectedSource: identifier?.identifierSources?.find((source) => source?.uuid === sourceUuid),
            }
          : identifier,
      ),
    );
  }, []);

  const identifiers = useMemo(
    () =>
      filteredIdentifiers.map((patientIdentifier) => (
        <div key={patientIdentifier.uuid} className={styles.space05}>
          <Checkbox
            id={patientIdentifier.uuid}
            value={patientIdentifier.uuid}
            labelText={patientIdentifier.name}
            onChange={(selected) => handleCheckingIdentifier(patientIdentifier?.uuid, selected)}
            checked={patientIdentifier?.selected || patientIdentifier?.isPrimary}
            disabled={
              patientIdentifier.isPrimary ||
              patientIdentifiers.find((identifier) => identifier?.uuid === patientIdentifier?.uuid).selected
            }
          />
          {patientIdentifier?.selected &&
            !patientIdentifier?.defaultSelected &&
            patientIdentifier?.identifierSources?.length > 0 && (
              <div className={styles.radioGroup}>
                <RadioButtonGroup
                  legendText={t('source', 'Source')}
                  name={`${patientIdentifier?.fieldName}-identifier-sources`}
                  defaultSelected={patientIdentifier?.selectedSource?.uuid}
                  onChange={(sourceUuid: string) =>
                    handleSelectingIdentifierSource(patientIdentifier?.uuid, sourceUuid)
                  }
                  orientation="vertical">
                  {patientIdentifier?.identifierSources.map((source, ind) => (
                    <RadioButton
                      key={ind}
                      labelText={source?.name}
                      name={source?.uuid}
                      value={source.uuid}
                      className={styles.radioButton}
                    />
                  ))}
                </RadioButtonGroup>
              </div>
            )}
        </div>
      )),
    [filteredIdentifiers],
  );

  const handleConfiguringIdentifiers = useCallback(() => {
    setPatientIdentifiers(identifierTypes);
    closeOverlay();
  }, [identifierTypes]);

  return (
    <Overlay
      close={closeOverlay}
      header={t('configureIdentifiers', 'Configure identifiers')}
      buttonsGroup={
        <div className={styles.overlayButtons}>
          <Button kind="secondary" size="lg" onClick={closeOverlay}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button kind="primary" size="lg" onClick={handleConfiguringIdentifiers}>
            {t('configureIdentifiers', 'Configure identifiers')}
          </Button>
        </div>
      }>
      <div>
        <p className={styles.bodyLong02}>
          {t('IDInstructions', "Select the identifiers you'd like to add for this patient:")}
        </p>
        {identifierTypes.length > 7 && (
          <div className={styles.space05}>
            <Search
              labelText={t('searchIdentifierPlaceholder', 'Search identifier')}
              placeholder={t('searchIdentifierPlaceholder', 'Search identifier')}
              onChange={handleSearch}
              value={searchString}
            />
          </div>
        )}
        <fieldset>{identifiers}</fieldset>
      </div>
    </Overlay>
  );
};

export default PatientIdentifierOverlay;
