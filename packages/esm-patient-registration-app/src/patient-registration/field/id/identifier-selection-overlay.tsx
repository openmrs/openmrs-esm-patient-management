import React, { useMemo, useCallback, useEffect, useState, Dispatch, SetStateAction, useContext } from 'react';
import styles from './identifier-selection.scss';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Search, RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { PatientIdentifierType, PatientIdentifierValue } from '../../patient-registration-types';
import Overlay from '../../ui-components/overlay';
import { ResourcesContext } from '../../../offline.resources';

interface PatientIdentifierOverlayProps {
  setFieldValue: (string, PatientIdentifierValue) => void;
  closeOverlay: () => void;
  push: (obj: PatientIdentifierValue) => void;
  remove: <T>(index: number) => T;
  identifiers: Array<PatientIdentifierValue>;
}

const PatientIdentifierOverlay: React.FC<PatientIdentifierOverlayProps> = ({
  closeOverlay,
  push,
  setFieldValue,
  identifiers,
  remove,
}) => {
  const { identifierTypes } = useContext(ResourcesContext);
  const [localIdentifierTypes, setLocalIdentifierTypes] = useState<Array<PatientIdentifierType>>([]);
  const [searchString, setSearchString] = useState<string>('');
  const { t } = useTranslation();
  const getIdentifierByTypeUuid = (identifierTypeUuid: string) =>
    identifiers.find((identifier) => identifier.identifierTypeUuid === identifierTypeUuid);

  useEffect(() => {
    if (identifierTypes) {
      setLocalIdentifierTypes(
        identifierTypes.map((identifierType) => {
          const identifier = getIdentifierByTypeUuid(identifierType.uuid);
          return {
            ...identifierType,
            checked: identifier ? identifier.action !== 'DELETE' : identifierType.isPrimary || identifierType.required,
            source: identifier?.source ?? identifierType.identifierSources?.[0],
          };
        }),
      );
    }
  }, [identifierTypes, identifiers]);

  const handleSearch = useCallback((event) => setSearchString(event?.target?.value ?? ''), []);

  const filteredIdentifiers = useMemo(
    () =>
      localIdentifierTypes?.filter((identifier) =>
        identifier?.name?.toLowerCase().includes(searchString.toLowerCase()),
      ),
    [localIdentifierTypes, searchString],
  );

  const handleCheckingIdentifier = (uuid: string, checked: boolean) =>
    setLocalIdentifierTypes((identifiers) =>
      identifiers.map((identifier) =>
        identifier.uuid === uuid
          ? {
              ...identifier,
              checked: identifier.isPrimary || identifier.required || checked,
            }
          : identifier,
      ),
    );

  const handleSelectingIdentifierSource = (identifierTypeUuid, sourceUuid) =>
    setLocalIdentifierTypes((localIdentifierTypes) =>
      localIdentifierTypes?.map((identifierType) =>
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
        const identifier = getIdentifierByTypeUuid(identifierType.uuid);
        const showIdentifierSources = !(identifier?.action === 'NONE');
        return (
          <div key={identifierType.uuid} className={styles.space05}>
            <Checkbox
              id={identifierType.uuid}
              value={identifierType.uuid}
              labelText={identifierType.name}
              onChange={(checked) => handleCheckingIdentifier(identifierType?.uuid, checked)}
              checked={identifierType.checked}
              disabled={
                identifier ? identifier.action !== 'DELETE' : identifierType.isPrimary || identifierType.required
              }
            />
            {showIdentifierSources && identifierType.checked && identifierType?.identifierSources?.length > 0 && (
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
    localIdentifierTypes.forEach((identifierType) => {
      const index = identifiers.findIndex((identifier) => identifier.identifierTypeUuid === identifierType.uuid);
      if (index >= 0) {
        const identifier = identifiers[index];
        if (!identifierType.checked && identifiers[index].action === 'ADD') {
          remove(index);
        } else {
          let action: PatientIdentifierValue['action'];

          if (identifierType.checked) {
            if (identifier.action === 'DELETE') {
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
          });
        }
      } else if (identifierType.checked) {
        push({
          identifier: '',
          action: 'ADD',
          source: identifierType.source,
          identifierTypeUuid: identifierType.uuid,
          preferred: identifierType.isPrimary,
        });
      }
    });
    closeOverlay();
  }, [localIdentifierTypes, identifiers]);

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
        {localIdentifierTypes.length > 7 && (
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
