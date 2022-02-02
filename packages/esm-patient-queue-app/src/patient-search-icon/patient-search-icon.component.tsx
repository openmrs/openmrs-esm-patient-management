import React, { useState } from 'react';
import { Button, Search } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import styles from './patient-search-icon.component.scss';
import Overlay from '../overlay.component';
import { useLayoutType } from '@openmrs/esm-framework';

interface PatientSearchLaunchProps {
  close: () => void;
}

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = ({ close }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [open, setOpen] = useState<boolean>(true);

  return (
    <>
      <Overlay header={t('addPatientToListHeader', 'Add patient to list')} close={close}>
        <div className={`omrs-main-content ${styles.container}`}>
          <div className="bx--grid">
            {open && (
              <div className="bx--row">
                <div className={styles.patientSearchIconWrapper}>
                  <div className={styles.searchArea}>
                    <Search
                      size={layout === 'desktop' ? 'sm' : 'xl'}
                      className={styles.patientSearchInput}
                      placeholder={t('searchForPatient', 'Search for a patient by name or identifier number')}
                      labelText=""
                      autoFocus={true}
                    />
                    <Button kind="ghost" size={layout === 'desktop' ? 'small' : 'default'}>
                      {t('clear', 'Clear')}
                    </Button>

                    <Button className={styles.searchButton} size={layout === 'desktop' ? 'small' : 'default'}>
                      {t('search', 'Search')}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Overlay>
    </>
  );
};

export default PatientSearchLaunch;
