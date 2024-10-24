import { Dropdown, InlineNotification, RadioButton, RadioButtonGroup, RadioButtonSkeleton } from '@carbon/react';
import { type Patient } from '@openmrs/esm-framework';
import React from 'react';
import { type Control, type FieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useWardLocation from '../hooks/useWardLocation';
import { type BedLayout } from '../types';
import styles from './bed-selector.scss';

interface BedSelectorProps {
  beds: BedLayout[];
  isLoadingBeds: boolean;
  currentPatient: Patient;
  selectedBedId: number;
  error: FieldError;
  onChange(bedId: number);
  control: Control<{ bedId?: number }, any, { bedId?: number }>;
  minBedCountToUseDropdown?: number;
}

interface BedDropdownItem {
  bedId: number;
  label: string;
  disabled: boolean;
}

const BedSelector: React.FC<BedSelectorProps> = ({
  selectedBedId,
  beds,
  isLoadingBeds,
  error,
  onChange,
  currentPatient,
  control,
  minBedCountToUseDropdown = 16,
}) => {
  const { location } = useWardLocation();
  const { t } = useTranslation();

  const getBedRepresentation = (bedLayout: BedLayout) => {
    const bedNumber = bedLayout.bedNumber;
    const patients =
      bedLayout.patients.length === 0
        ? [t('emptyText', 'Empty')]
        : bedLayout.patients.map((patient) => patient?.person?.preferredName?.display);
    return [bedNumber, ...patients].join(' · ');
  };

  const bedDropdownItems: BedDropdownItem[] = [
    { bedId: 0, label: t('noBed', 'No bed'), disabled: false },
    ...beds.map((bed) => {
      const isPatientAssignedToBed = bed.patients.some((bedPatient) => bedPatient.uuid === currentPatient.uuid);
      return { bedId: bed.bedId, label: getBedRepresentation(bed), disabled: isPatientAssignedToBed };
    }),
  ];
  const selectedItem = bedDropdownItems.find((bed) => bed.bedId === selectedBedId);

  const useDropdown = beds.length >= minBedCountToUseDropdown;

  if (isLoadingBeds) {
    return (
      <RadioButtonGroup className={styles.radioButtonGroup} name="bedId">
        <RadioButtonSkeleton />
        <RadioButtonSkeleton />
        <RadioButtonSkeleton />
      </RadioButtonGroup>
    );
  }
  if (!beds.length) {
    return (
      <InlineNotification
        kind="error"
        title={t('noBedsConfiguredForLocation', 'No beds configured for {{location}} location', {
          location: location?.display,
        })}
        lowContrast
        hideCloseButton
      />
    );
  }
  if (useDropdown) {
    return (
      <Dropdown
        id="default"
        titleText=""
        helperText=""
        label={!selectedItem && t('chooseAnOption', 'Choose an option')}
        items={bedDropdownItems}
        itemToString={(bedDropdownItem: BedDropdownItem) => bedDropdownItem.label}
        selectedItem={selectedItem}
        onChange={({ selectedItem }: { selectedItem: BedLayout }) => onChange(selectedItem.bedId)}
        invalid={!!error}
        invalidText={error?.message}
      />
    );
  } else {
    return (
      <RadioButtonGroup
        name="bedId"
        className={styles.radioButtonGroup}
        onChange={onChange}
        invalid={!!error}
        invalidText={error?.message}>
        {bedDropdownItems.map(({ bedId, label, disabled }) => (
          <RadioButton
            key={bedId}
            labelText={label}
            control={control}
            value={bedId}
            checked={bedId === selectedBedId}
            disabled={disabled}
          />
        ))}
      </RadioButtonGroup>
    );
  }
};

export default BedSelector;
