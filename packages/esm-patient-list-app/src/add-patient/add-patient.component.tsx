import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { toOmrsIsoString, showToast, usePagination, useSession } from '@openmrs/esm-framework';
import { Button, Checkbox, Pagination, Search, SkeletonText } from 'carbon-components-react';
import styles from './add-patient.scss';
import { addPatientToLocalOrRemotePatientList } from '../api/api';
import { useAllPatientListsWhichDoNotIncludeGivenPatient } from '../api/hooks';

interface AddPatientProps {
  closeModal: () => void;
  patientUuid: string;
}

interface PatientListProp {
  name: string;
  visible: boolean;
  selected: boolean;
}

type PatientListObj = Record<string, PatientListProp>;

const AddPatient: React.FC<AddPatientProps> = ({ closeModal, patientUuid }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const userId = useSession()?.user.uuid;
  const { data, isValidating } = useAllPatientListsWhichDoNotIncludeGivenPatient(userId, patientUuid);
  const [patientListsObj, setPatientListsObj] = useState<PatientListObj | null>(null);

  useEffect(() => {
    if (data) {
      const newPatientListsObj: PatientListObj = {};

      for (const patientList of data) {
        newPatientListsObj[patientList.id] = {
          visible: true,
          selected: false,
          name: patientList?.display,
        };
      }

      setPatientListsObj(newPatientListsObj);
    }
  }, [data]);

  const handleChange = useCallback((uuid, e) => {
    setPatientListsObj((patientListsObj) => ({
      ...patientListsObj,
      [uuid]: {
        ...patientListsObj[uuid],
        selected: e,
      },
    }));
  }, []);

  const handleClose = useCallback(() => {
    closeModal();
  }, []);

  const handleSubmit = useCallback(() => {
    Object.keys(patientListsObj).forEach((patientListUuid) => {
      if (patientListsObj[patientListUuid].selected) {
        addPatientToLocalOrRemotePatientList(userId, {
          patient: patientUuid,
          cohort: patientListUuid,
          startDate: toOmrsIsoString(new Date()),
        })
          .then(() =>
            showToast({
              title: t('successfullyAdded', 'Successfully added'),
              kind: 'success',
              description: `${t('successAddPatientToList', 'Patient added to list')}: ${
                patientListsObj[patientListUuid].name
              }`,
            }),
          )
          .catch(() =>
            showToast({
              title: t('error', 'Error'),
              kind: 'error',
              description: `${t('errorAddPatientToList', 'Patient not added to list')}: ${
                patientListsObj[patientListUuid].name
              }`,
            }),
          );
      }
    });
    handleClose();
  }, [patientListsObj]);

  const searchResults = useMemo(() => {
    if (data && patientListsObj) {
      if (searchValue && searchValue.trim() !== '') {
        const search = searchValue.toLowerCase();
        return data.filter(
          (patientList) =>
            patientListsObj[patientList.id]?.visible && patientList.display.toLowerCase().includes(search),
        );
      } else {
        return data.filter((patientList) => patientListsObj[patientList.id]?.visible);
      }
    } else {
      return [];
    }
  }, [searchValue, data, patientListsObj]);
  const { results, goTo, currentPage, paginated } = usePagination(searchResults, 5);

  useEffect(() => {
    if (currentPage !== 1) {
      goTo(1);
    }
  }, [searchValue]);

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
          value={searchValue}
        />
      </div>
      <div className={styles.patientListList}>
        <fieldset className="bx--fieldset">
          <p className="bx--label">Patient Lists</p>
          {!isValidating && patientListsObj && results ? (
            results.length > 0 ? (
              results.map((patientList, ind) => (
                <div key={ind} className={styles.checkbox}>
                  <Checkbox
                    key={ind}
                    onChange={(e) => handleChange(patientList.id, e)}
                    checked={patientListsObj[patientList.id]?.selected}
                    labelText={patientList.display}
                    id={patientList.id}
                  />
                </div>
              ))
            ) : (
              <p className={styles.bodyLong01}>{t('noPatientListFound', 'No patient list found')}</p>
            )
          ) : (
            <SkeletonText />
          )}
        </fieldset>
      </div>
      {paginated && (
        <div className={styles.paginationContainer}>
          <span className={`${styles.itemsCountDisplay} ${styles.bodyLong01}`}>
            {results.length * currentPage} / {searchResults.length} {t('items', 'items')}
          </span>
          <Pagination
            className={styles.pagination}
            forwardText=""
            backwardText=""
            page={currentPage}
            pageSize={5}
            pageSizes={[5]}
            totalItems={searchResults.length}
            onChange={({ page }) => goTo(page)}
          />
        </div>
      )}
      <div className={styles.buttonSet}>
        <Button kind="ghost">{t('createNewPatientList', 'Create new patient list')}</Button>
        <div>
          <Button kind="secondary" className={styles.largeButtons} onClick={handleClose}>
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
