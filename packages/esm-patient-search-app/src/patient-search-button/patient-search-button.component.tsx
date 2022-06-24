import React, { useCallback, useState, useEffect } from 'react';
import { Button, ButtonDefaultProps, ButtonKindProps } from 'carbon-components-react';
import Search20 from '@carbon/icons-react/es/search/20';
import PatientSearchBar from '../patient-search-bar/patient-search-bar.component';
import Overlay from '../ui-components/overlay';
import { useTranslation } from 'react-i18next';

interface PatientSearchButtonProps {
  buttonText?: string;
  overlayHeader?: string;
  selectPatientAction?: (patientUuid: string) => {};
  buttonProps?: {};
}

const PatientSearchButton: React.FC<PatientSearchButtonProps> = ({
  buttonText,
  overlayHeader,
  selectPatientAction,
  buttonProps,
}) => {
  const [showSearchOverlay, setShowSearchOverlay] = useState<boolean>(false);
  const { t } = useTranslation();

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
        renderIcon={Search20}
        {...buttonProps}>
        {buttonText ? buttonText : t('searchPatient', 'Search Patient')}
      </Button>
    </>
  );
};

export default PatientSearchButton;
