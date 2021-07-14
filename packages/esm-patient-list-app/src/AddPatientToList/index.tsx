import React, { useState, useEffect } from 'react';
import Search from 'carbon-components-react/lib/components/Search';
import Button from 'carbon-components-react/lib/components/Button';
import Checkbox from 'carbon-components-react/lib/components/Checkbox';
import { usePatientListData } from '../patientListData';
import { useTranslation } from 'react-i18next';
import styles from './add-patient-to-list.scss';

import { OpenmrsCohort, addPatientToList } from '../patientListData/api';
import SkeletonText from 'carbon-components-react/es/components/SkeletonText';
import { toOmrsIsoString } from '@openmrs/esm-framework';

const CheckboxedPatientList = ({ name, uuid, checked, handleChange }) => {
  return (
    <div className={styles.checkbox}>
      <Checkbox checked={checked} labelText={name} id={uuid} onChange={(e) => handleChange(uuid, e)} />
    </div>
  );
};

const AddPatient: React.FC<{ close: () => void; patientUuid: string }> = ({ close, patientUuid }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = React.useState('');
  const { loading, data } = usePatientListData(undefined, undefined, undefined, searchValue);
  const [selectedLists, setSelectedList] = useState({});

  useEffect(() => {
    const lists = {};
    if (data) {
      data.map((patientList, ind) => {
        lists[patientList.uuid] = false;
      });
    }
    setSelectedList(lists);
  }, [data]);

  const handleChange = (uuid, e) => {
    setSelectedList((selectedLists) => ({
      ...selectedLists,
      [uuid]: e,
    }));
  };

  const handleSubmit = () => {
    data.map((patientList) => {
      if (selectedLists[patientList.uuid]) {
        addPatientToList({
          patient: 'b2f86b28-7998-4812-83a9-7f8ad3c47e66',
          cohort: patientList.uuid,
          startDate: toOmrsIsoString(new Date()),
        });
      }
    });
  };

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
                <CheckboxedPatientList
                  key={ind}
                  handleChange={handleChange}
                  checked={selectedLists[patientList.uuid] === undefined}
                  name={patientList.name}
                  uuid={patientList.uuid}
                />
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
