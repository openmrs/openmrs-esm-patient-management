import React, { useMemo, useCallback, useEffect, useState, Dispatch, SetStateAction } from 'react';
import styles from './identifier-selection.scss';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Search, RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { PatientIdentifierType, PatientIdentifierValueType } from '../../patient-registration-types';
import Overlay from '../overlay/overlay.component';

interface PatientIdentifierOverlayProps {
  setFieldValue: (string, any) => void;
  patientIdentifiers: PatientIdentifierType[];
  closeOverlay: () => void;
  push: (obj: any) => void;
  remove: <T>(index: number) => T;
  identifiers: PatientIdentifierValueType[];
}

const PatientIdentifierOverlay: React.FC<PatientIdentifierOverlayProps> = ({
  patientIdentifiers,
  closeOverlay,
  push,
  setFieldValue,
  identifiers,
  remove,
}) => {
  const [identifierTypes, setIdentifierTypes] = useState<PatientIdentifierType[]>([]);
  const [searchString, setSearchString] = useState<string>('');
  const { t } = useTranslation();
  const getIdentifierByFieldName = useCallback(
    (identifierFieldName: string) => identifiers.find((identifier) => identifier.fieldName === identifierFieldName),
    [identifiers],
  );

  useEffect(() => {
    if (patientIdentifiers) {
      setIdentifierTypes(
        patientIdentifiers.map((identifierType) => {
          const identifier = getIdentifierByFieldName(identifierType.fieldName);
          return {
            ...identifierType,
            checked: identifier ? identifier.action !== 'DELETE' : identifierType.isPrimary,
            source: identifier
              ? identifier.source
              : identifierType.identifierSources.length > 0
              ? identifierType.identifierSources[0]
              : null,
          };
        }),
      );
    }
  }, [patientIdentifiers, identifiers]);

  const handleSearch = useCallback((event) => setSearchString(event?.target?.value), []);

  const filteredIdentifiers = useMemo(
    () => identifierTypes?.filter((identifier) => identifier?.name?.toLowerCase().includes(searchString.toLowerCase())),
    [identifierTypes, searchString],
  );

  const handleCheckingIdentifier = (uuid: string, checked: boolean) =>
    setIdentifierTypes((identifiers) =>
      identifiers.map((identifier) =>
        identifier.uuid === uuid
          ? {
              ...identifier,
              checked: identifier.isPrimary || checked,
            }
          : identifier,
      ),
    );

  const handleSelectingIdentifierSource = (identifierTypeUuid, sourceUuid) =>
    setIdentifierTypes((identifierTypes) =>
      identifierTypes?.map((identifierType) =>
        identifierType?.uuid === identifierTypeUuid
          ? {
              ...identifierType,
              source: identifierType?.identifierSources.find((source) => source?.uuid === sourceUuid),
            }
          : identifierType,
      ),
    );

  const identifierTypeFields = useMemo(
    () =>
      filteredIdentifiers.map((identifierType) => {
        const identifier = getIdentifierByFieldName(identifierType.fieldName);
        const disabled = identifier ? identifier.action === 'NONE' : false;
        return (
          <div key={identifierType.uuid} className={styles.space05}>
            <Checkbox
              id={identifierType.uuid}
              value={identifierType.uuid}
              labelText={identifierType.name}
              onChange={(checked) => handleCheckingIdentifier(identifierType?.uuid, checked)}
              checked={identifierType.checked}
              disabled={disabled}
            />
            {!disabled && identifierType.checked && identifierType?.identifierSources?.length > 0 && (
              <div className={styles.radioGroup}>
                <RadioButtonGroup
                  legendText={t('source', 'Source')}
                  name={`${identifierType?.fieldName}-identifier-sources`}
                  defaultSelected={identifier?.source?.uuid}
                  onChange={(sourceUuid: string) => handleSelectingIdentifierSource(identifierType?.uuid, sourceUuid)}
                  orientation="vertical">
                  {identifierType?.identifierSources.map((source, ind) => (
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
        );
      }),
    [filteredIdentifiers],
  );

  const handleConfiguringIdentifiers = useCallback(() => {
    identifierTypes.forEach((identifierType) => {
      const index = identifiers.findIndex((identifier) => identifier.fieldName === identifierType.fieldName);
      const identifier = identifiers[index];
      if (index >= 0) {
        if (!identifierType.checked && identifiers[index].action === 'ADD') {
          remove(index);
        } else {
          let action: PatientIdentifierValueType['action'];

          if (identifierType.checked) {
            if (identifier.action === 'ADD') {
              action = 'ADD';
            } else if (identifier.action === 'DELETE') {
              action = 'UPDATE';
            } else {
              action = identifier.action;
            }
          } else {
            if (identifier.action === 'UPDATE') {
              action = 'DELETE';
            }
          }

          setFieldValue(`identifiers[${index}]`, {
            ...identifiers[index],
            action: action,
            source: action === 'ADD' || action === 'UPDATE' ? identifierType.source : null,
          } as PatientIdentifierValueType);
        }
      } else if (identifierType.checked) {
        push({
          name: identifierType.name,
          fieldName: identifierType.fieldName,
          value: '',
          action: 'ADD',
          source: identifierType.source,
          isPrimary: identifierType.isPrimary,
        } as PatientIdentifierValueType);
      }
    });
    closeOverlay();
  }, [identifierTypes, identifiers]);

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
        <fieldset>{identifierTypeFields}</fieldset>
      </div>
    </Overlay>
  );
};

export default PatientIdentifierOverlay;
