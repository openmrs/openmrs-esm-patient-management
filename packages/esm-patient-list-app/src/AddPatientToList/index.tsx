import React, { useState, useEffect } from 'react';
import Search from 'carbon-components-react/lib/components/Search';
import Button from 'carbon-components-react/lib/components/Button';
import Checkbox from 'carbon-components-react/lib/components/Checkbox';
import { usePatientListData } from '../patientListData';
import { useTranslation } from 'react-i18next';
import styles from './add-patient-to-list.scss';

import { OpenmrsCohort, addPatientToList, getPatientListsForPatient } from '../patientListData/api';
import SkeletonText from 'carbon-components-react/es/components/SkeletonText';
import { toOmrsIsoString } from '@openmrs/esm-framework';
import { useCallback } from 'react';

const AddPatient: React.FC<{ close: () => void; patientUuid: string }> = ({ close, patientUuid }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const { loading, data } = usePatientListData(undefined, undefined, undefined, searchValue);
  const [selectedLists, setSelectedList] = useState({});

  useEffect(() => {
    const lists = {};
    if (data) {
      data.map((patientList) => {
        lists[patientList.uuid] = false;
      });
    }
    getPatientListsForPatient(patientUuid).then((res) => console.log(res));
    setSelectedList(lists);
  }, [data]);

  const handleChange = useCallback((uuid, e) => {
    setSelectedList((selectedLists) => ({
      ...selectedLists,
      [uuid]: e,
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    data.map((patientList) => {
      if (selectedLists[patientList.uuid]) {
        addPatientToList({
          patient: patientUuid,
          cohort: patientList.uuid,
          startDate: toOmrsIsoString(new Date()),
        });
      }
    });
  }, []);

  return (
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h1 className={styles.productiveHeading03}>{t('addPatientToList', 'Add patient to list')}</h1>
        <h3 className={styles.bodyLong01} style={{ margin: '1rem 0' }}>
          {t('searchForAListToAddThisPatientTo', 'Search for a list to add this patient to.')}
        </h3>
      </div>
      <div style={{ marginBottom: '0.875rem' }}>
        <Search
          style={{ backgroundColor: 'white', borderBottom: '1px solid #e0e0e0' }}
          labelText={t('searchForList', 'Search for a list')}
          placeholder="Filter list"
          onChange={({ target }) => {
            setSearchValue(target.value);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              // trigger search or search on typing?
            }
          }}
          value={searchValue}
        />
      </div>
      <div className={styles.patientListList}>
        <fieldset className="bx--fieldset">
          <p className="bx--label">Patient Lists</p>
          {!loading && data ? (
            data.length > 0 ? (
              data.map((patientList, ind) => (
                <div key={ind} className={styles.checkbox}>
                  <Checkbox
                    key={ind}
                    onChange={(e) => handleChange(patientList.uuid, e)}
                    checked={selectedLists[patientList.uuid] === undefined}
                    labelText={patientList.name}
                    id={patientList.uuid}
                  />
                </div>
              ))
            ) : (
              <p className={styles.bodyLong01}>No patient list found</p>
            )
          ) : (
            <SkeletonText />
          )}
        </fieldset>
      </div>
      <div className={styles.buttonSet}>
        <Button kind="ghost">{t('createNewPatientList', 'Create new patient list')}</Button>
        <div>
          <Button kind="secondary" className={styles.largeButtons} onClick={close}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSubmit} className={styles.largeButtons}>
            {t('addToList', 'Add to list')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AddPatient;
