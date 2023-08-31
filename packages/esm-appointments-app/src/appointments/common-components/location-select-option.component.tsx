import React from 'react';
import { useTranslation } from 'react-i18next';
import { SelectItem } from '@carbon/react';

interface SelectLocationProps {
  selectedLocation: string;
  defaultFacility: {
    uuid: string;
    display: string;
  };
  locations?: Array<LocationOptions>;
}

interface LocationOptions {
  uuid?: string;
  display?: string;
}

const LocationSelectOption: React.FC<SelectLocationProps> = ({ selectedLocation, defaultFacility, locations }) => {
  const { t } = useTranslation();
  if (!selectedLocation) {
    return <SelectItem text={t('selectOption', 'Select an option')} value="" />;
  }

  if (defaultFacility && Object.keys(defaultFacility).length !== 0) {
    return (
      <SelectItem key={defaultFacility?.uuid} text={defaultFacility?.display} value={defaultFacility?.uuid}>
        {defaultFacility?.display}
      </SelectItem>
    );
  }

  if (locations && locations.length > 0) {
    return (
      <>
        {locations.map((location) => (
          <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
            {location.display}
          </SelectItem>
        ))}
      </>
    );
  }

  return null;
};

export default LocationSelectOption;
