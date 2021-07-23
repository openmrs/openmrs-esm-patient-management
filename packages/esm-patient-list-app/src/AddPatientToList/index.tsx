import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePatientListData } from '../patientListData';
import { useTranslation } from 'react-i18next';
import { addPatientToList, getPatientListsForPatient } from '../patientListData/api';
import { toOmrsIsoString } from '@openmrs/esm-framework';
import Search from 'carbon-components-react/lib/components/Search';
import Button from 'carbon-components-react/lib/components/Button';
import Checkbox from 'carbon-components-react/lib/components/Checkbox';
import SkeletonText from 'carbon-components-react/es/components/SkeletonText';
import styles from './add-patient-to-list.scss';

interface AddPatientProps {
  close: () => void;
  patientUuid: string;
}

const AddPatient: React.FC<AddPatientProps> = ({ close, patientUuid }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const { loading, data } = usePatientListData();
  const [selectedLists, setSelectedList] = useState({});

  useEffect(() => {
    if (data) {
      const lists = {};
      data.map((patientList) => {
        lists[patientList.uuid] = {
          visible: true,
          selected: false,
        };
      });
      getPatientListsForPatient(patientUuid).then((enrolledPatientLists) => {
        enrolledPatientLists.forEach((patientList) => {
          lists[patientList.cohort.uuid].visible = false;
        });
        setSelectedList(lists);
      });
    }
  }, [data]);

  const searchResults = useMemo(() => {
    if (data) {
      if (searchValue && searchValue.trim() !== '') {
        const search = searchValue.toLowerCase();
        return data.filter((patientList) => patientList.name.toLowerCase().includes(search));
      } else {
        return data;
      }
    } else {
      return [];
    }
  }, [searchValue, data]);

  const handleChange = useCallback((uuid, e) => {
    setSelectedList((selectedLists) => ({
      ...selectedLists,
      [uuid]: {
        ...selectedLists[uuid],
        selected: e,
      },
    }));
  }, []);

  const handleSubmit = useCallback(() => {
    Object.keys(selectedLists).forEach((patientListUuid) => {
      if (selectedLists[patientListUuid].selected) {
        addPatientToList({
          patient: patientUuid,
          cohort: patientListUuid,
          startDate: toOmrsIsoString(new Date()),
        });
      }
    });
  }, [selectedLists]);

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
          {!loading && searchResults ? (
            searchResults.length > 0 ? (
              searchResults.map(
                (patientList, ind) =>
                  selectedLists[patientList.uuid]?.visible && (
                    <div key={ind} className={styles.checkbox}>
                      <Checkbox
                        key={ind}
                        onChange={(e) => handleChange(patientList.uuid, e)}
                        checked={selectedLists[patientList.uuid]?.selected}
                        labelText={patientList.name}
                        id={patientList.uuid}
                      />
                    </div>
                  ),
              )
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
