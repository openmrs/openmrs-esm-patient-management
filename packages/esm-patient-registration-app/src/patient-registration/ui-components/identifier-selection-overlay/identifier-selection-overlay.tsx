import React, { useMemo, useCallback, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { useLayoutType } from '@openmrs/esm-framework';
import styles from './identifier-selection.scss';
import { Close24, ArrowLeft24 } from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Search, RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { CustomPatientIdentifierType } from '../../patient-registration-types';

interface PatientIdentifierOverlayProps {
  patientIdentifiers: CustomPatientIdentifierType[];
  closeOverlay: () => void;
  setPatientIdentifiers: Dispatch<SetStateAction<CustomPatientIdentifierType[]>>;
}

const PatientIdentifierOverlay: React.FC<PatientIdentifierOverlayProps> = ({
  patientIdentifiers,
  closeOverlay,
  setPatientIdentifiers,
}) => {
  const [identifierTypes, setIdentifierTypes] = useState<CustomPatientIdentifierType[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [searchString, setSearchString] = useState<string>('');
  const layout = useLayoutType();
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

  const handleChange = useCallback((uuid: string, selected: boolean) => {
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

  const handleIdentifierSelect = useCallback((patientIdentifierUuid, sourceUuid) => {
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

  const identifierTypeCheckboxes = useMemo(
    () =>
      filteredIdentifiers.map((patientIdentifier) => (
        <div key={patientIdentifier.uuid} className={styles.space05}>
          <Checkbox
            id={patientIdentifier.uuid}
            value={patientIdentifier.uuid}
            labelText={patientIdentifier.name}
            onChange={(selected) => handleChange(patientIdentifier?.uuid, selected)}
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
                  onChange={(sourceUuid: string) => handleIdentifierSelect(patientIdentifier?.uuid, sourceUuid)}
                  orientation="vertical">
                  {patientIdentifier?.identifierSources.map((source, ind) => (
                    <RadioButton key={ind} labelText={source?.name} name={source?.uuid} value={source.uuid} />
                  ))}
                </RadioButtonGroup>
              </div>
            )}
        </div>
      )),
    [filteredIdentifiers, error],
  );

  const handleAddIdentifier = useCallback(() => {
    setPatientIdentifiers(identifierTypes);
    closeOverlay();
  }, [identifierTypes]);

  return (
    <div className={`${styles.overlay} ${layout === 'tablet' ? styles.fullScreenOverlay : styles.desktopOverlay}`}>
      <div>
        {layout === 'desktop' ? (
          <div className={styles.patientIdentifierOverlayHeaderDesktop}>
            <h4 className={styles.productiveHeading02}>{t('setIDNumbers', 'Set ID numbers')}</h4>
            <Button kind="ghost" size="small" onClick={closeOverlay} hasIconOnly iconDescription="">
              <Close24 />
            </Button>
          </div>
        ) : (
          <div className={styles.patientIdentifierOverlayHeaderTablet}>
            <Button kind="ghost" iconDescription="" size="small" onClick={closeOverlay} hasIconOnly>
              <ArrowLeft24 />
            </Button>
            <h4 className={styles.productiveHeading02}>{t('setIDNumbers', 'Set ID numbers')}</h4>
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
          {t('setIDNumbers', 'Set ID numbers')}
        </Button>
      </div>
    </div>
  );
};

export default PatientIdentifierOverlay;
