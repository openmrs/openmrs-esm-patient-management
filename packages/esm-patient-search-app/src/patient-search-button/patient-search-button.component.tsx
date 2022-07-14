import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { Search } from '@carbon/react/icons';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import Overlay from '../ui-components/overlay';

interface PatientSearchButtonProps {
  buttonText?: string;
  overlayHeader?: string;
  selectPatientAction?: (patientUuid: string) => {};
  buttonProps?: Object;
}

const PatientSearchButton: React.FC<PatientSearchButtonProps> = ({
  buttonText,
  overlayHeader,
  selectPatientAction,
  buttonProps,
}) => {
  const { t } = useTranslation();
  const [showSearchOverlay, setShowSearchOverlay] = useState<boolean>(false);

  return (
    <>
      {showSearchOverlay && (
        <Overlay
          close={() => setShowSearchOverlay(false)}
          header={overlayHeader ? overlayHeader : t('searchResults', 'Search Results')}>
          <PatientSearchBar
            hidePanel={() => setShowSearchOverlay(false)}
            selectPatientAction={selectPatientAction}
            floatingSearchResults={false}
          />
        </Overlay>
      )}

      <Button
        onClick={() => setShowSearchOverlay(true)}
        aria-label="Search Patient Button"
        aria-labelledby="Search Patient Button"
        renderIcon={(props) => <Search size={20} />}
        {...buttonProps}>
        {buttonText ? buttonText : t('searchPatient', 'Search Patient')}
      </Button>
    </>
  );
};

export default PatientSearchButton;
