import React, { useState } from 'react';
import { Button, Search, Tile } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import styles from './patient-search.component.scss';
import Overlay from '../overlay.component';
import { useLayoutType } from '@openmrs/esm-framework';
import UserFilled16 from '@carbon/icons-react/es/user--filled/16';
import PatientAdvancedSearchLaunch from '../patient-advanced-search/patient-advanced-search.component';

interface PatientSearchLaunchProps {
  close: () => void;
}

const PatientSearchLaunch: React.FC<PatientSearchLaunchProps> = ({ close }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [open, setOpen] = useState<boolean>(true);
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(false);

  return (
    <>
      <Overlay header={t('addPatientToListHeader', 'Add patient to list')} close={close}>
        <div className={`omrs-main-content ${styles.container}`}>
          {open && (
            <div>
              <div className={styles.patientSearchIconWrapper}>
                <div className={styles.searchArea}>
                  <Search
                    light
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

              <div className={styles.searchText}>
                <Tile light className={styles.searchContent}>
                  <div className={styles.search}>
                    <div className={styles.search__circle}>
                      <UserFilled16 className={styles.userIcon} />
                    </div>
                    <div className={styles.search__rectangle}></div>
                  </div>
                  <p className={styles.searchPatient}>Search for a patient</p>
                  <p> Type a patient's name or </p> <b></b>
                  <p> unique ID number</p>
                </Tile>

                <h5 className={styles.h5}>
                  <span className={styles.span}> or</span>
                </h5>

                <Button
                  kind="ghost"
                  iconDescription="Advanced Search"
                  onClick={() => {
                    setAdvancedOpen(true);
                    setOpen(false);
                  }}>
                  {t('advancedSearch', 'Advanced Search')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Overlay>
      {advancedOpen && <PatientAdvancedSearchLaunch close={() => true} />}
    </>
  );
};

export default PatientSearchLaunch;
