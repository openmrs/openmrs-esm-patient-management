import React, { useMemo, useCallback, useEffect, useState, Dispatch, SetStateAction, useContext } from 'react';
import styles from './identifier-selection.scss';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Search, RadioButtonGroup, RadioButton } from 'carbon-components-react';
import { PatientIdentifierType, PatientIdentifierValue } from '../../patient-registration-types';
import Overlay from '../../ui-components/overlay';
import { ResourcesContext } from '../../../offline.resources';
import { PatientRegistrationContext } from '../../patient-registration-context';
import {
  isUniqueIdentifierTypeForOffline,
  shouldBlockPatientIdentifierInOfflineMode,
} from '../../input/custom-input/identifier/utils';

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
  const { isOffline } = useContext(PatientRegistrationContext);
  const [unsavedIdentifierTypes, setUnsavedIdentifierTypes] = useState<Array<PatientIdentifierType>>([]);
  const [searchString, setSearchString] = useState<string>('');
  const { t } = useTranslation();
  const getIdentifierByTypeUuid = (identifierTypeUuid: string) =>
    identifiers.find((identifier) => identifier.identifierTypeUuid === identifierTypeUuid);

  useEffect(() => {
    if (identifierTypes) {
      setUnsavedIdentifierTypes(
        identifierTypes.map((identifierType) => {
          const identifier = getIdentifierByTypeUuid(identifierType.uuid);
          const alreadySelectedSource = identifier?.source;
          const defaultSelectedSource =
            isOffline && isUniqueIdentifierTypeForOffline(identifierType)
              ? identifierType.identifierSources?.find(
                  (identifierSource) =>
                    !identifierSource.autoGenerationOption?.manualEntryEnabled &&
                    identifierSource.autoGenerationOption?.automaticGenerationEnabled,
                )
              : identifierType.identifierSources?.[0];

          return {
            ...identifierType,
            checked: identifier ? identifier.action !== 'DELETE' : identifierType.isPrimary || identifierType.required,
            source: alreadySelectedSource ?? defaultSelectedSource,
          };
        }),
      );
    }
  }, [identifierTypes, identifiers]);

  const handleSearch = useCallback((event) => setSearchString(event?.target?.value ?? ''), []);

  const filteredIdentifiers = useMemo(
    () =>
      unsavedIdentifierTypes?.filter((identifier) =>
        identifier?.name?.toLowerCase().includes(searchString.toLowerCase()),
      ),
    [unsavedIdentifierTypes, searchString],
  );

  const handleCheckingIdentifier = (uuid: string, checked: boolean) =>
    setUnsavedIdentifierTypes((identifiers) =>
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
    setUnsavedIdentifierTypes((unsavedIdentifierTypes) =>
      unsavedIdentifierTypes?.map((identifierType) =>
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
        const isDisabled = identifier
          ? identifier.action !== 'DELETE'
          : identifierType.isPrimary || identifierType.required;
        const isDisabledOffline = isOffline && shouldBlockPatientIdentifierInOfflineMode(identifierType);

        return (
          <div key={identifierType.uuid} className={styles.space05}>
            <Checkbox
              id={identifierType.uuid}
              value={identifierType.uuid}
              labelText={identifierType.name}
              onChange={(checked) => handleCheckingIdentifier(identifierType?.uuid, checked)}
              checked={identifierType.checked}
              disabled={isDisabled || (isOffline && isDisabledOffline)}
            />
            {showIdentifierSources && identifierType.checked && identifierType?.identifierSources?.length > 0 && (
              <div className={styles.radioGroup}>
                <RadioButtonGroup
                  legendText={t('source', 'Source')}
                  name={`${identifierType?.fieldName}-identifier-sources`}
                  defaultSelected={identifier?.source?.uuid}
                  onChange={(sourceUuid: string) => handleSelectingIdentifierSource(identifierType?.uuid, sourceUuid)}
                  orientation="vertical">
                  {identifierType?.identifierSources.map((source) => (
                    <RadioButton
                      key={source.uuid}
                      labelText={source.name}
                      name={source.uuid}
                      value={source.uuid}
                      className={styles.radioButton}
                      disabled={
                        isOffline &&
                        isUniqueIdentifierTypeForOffline(identifierType) &&
                        source.autoGenerationOption?.manualEntryEnabled
                      }
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
    unsavedIdentifierTypes.forEach((identifierType) => {
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
  }, [unsavedIdentifierTypes, identifiers]);

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
        {unsavedIdentifierTypes.length > 7 && (
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
