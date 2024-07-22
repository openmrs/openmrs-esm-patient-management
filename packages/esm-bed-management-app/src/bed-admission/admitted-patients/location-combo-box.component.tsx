import React, { useState } from 'react';
import { ComboBox, FormGroup } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { useLocationsByTag } from '../../summary/summary.resource';
import { useConfig, useSession } from '@openmrs/esm-framework';

const LocationComboBox = ({ setLocationUuid }) => {
  const { t } = useTranslation();
  const { admissionLocationTagUuid } = useConfig();
  const session = useSession();
  const [selectedLocationId] = useState('');

  const { data: admissionLocations } = useLocationsByTag(admissionLocationTagUuid);

  const filterLocationNames = (location) => {
    return location.item.display?.toLowerCase().includes(location?.inputValue?.toLowerCase()) ?? [];
  };

  return (
    <FormGroup>
      <ComboBox
        aria-label={t('location', 'Locations')}
        id="location"
        label={t('location', 'Locations')}
        shouldFilterItem={filterLocationNames}
        items={admissionLocations}
        onChange={({ selectedItem }) => {
          setLocationUuid(selectedItem?.uuid ?? '');
        }}
        selectedItem={admissionLocations?.find((location) => location?.uuid === selectedLocationId)}
        itemToString={(location) => location?.display ?? ''}
        placeholder={t('selectNewLocation', 'Select a new location')}
        title={selectedLocationId}
        initialSelectedItem={session.sessionLocation ?? ''}
      />
    </FormGroup>
  );
};

export default LocationComboBox;
