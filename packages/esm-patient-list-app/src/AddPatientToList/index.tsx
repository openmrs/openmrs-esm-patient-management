import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { usePatientListData } from '../patientListData';
import { useTranslation } from 'react-i18next';
import { addPatientToList, getPatientListsForPatient } from '../patientListData/api';
import { toOmrsIsoString, showToast, showModal, usePagination } from '@openmrs/esm-framework';
import Search from 'carbon-components-react/lib/components/Search';
import Button from 'carbon-components-react/lib/components/Button';
import Pagination from 'carbon-components-react/lib/components/Pagination';
import Checkbox from 'carbon-components-react/lib/components/Checkbox';
import SkeletonText from 'carbon-components-react/es/components/SkeletonText';
import styles from './add-patient-to-list.scss';

function getPatientUuidFromUrl(): string {
  const match = /\/patient\/([a-zA-Z0-9\-]+)\/?/.exec(location.pathname);
  return match && match[1];
}

interface AddPatientProps {
  closeModal: () => void;
}

interface PatientListProp {
  name: string;
  visible: boolean;
  selected: boolean;
}

type PatientListObj = Record<string, PatientListProp>;

const AddPatient: React.FC<AddPatientProps> = ({ closeModal }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const { loading, data } = usePatientListData();
  const [page, setPage] = useState(1);
  const [patientListsObj, setPatientListsObj] = useState<PatientListObj | null>(null);
  const patientUuid = getPatientUuidFromUrl();

  useEffect(() => {
    if (data) {
      const lists: PatientListObj = {};
      data.map((patientList) => {
        lists[patientList.id] = {
          visible: true,
          selected: false,
          name: patientList?.display,
        };
      });
      getPatientListsForPatient(patientUuid).then((enrolledPatientLists) => {
        enrolledPatientLists.forEach((patientList) => {
          lists[patientList.cohort.uuid].visible = false;
        });
        setPatientListsObj(lists);
      });
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
        addPatientToList({
          patient: patientUuid,
          cohort: patientListUuid,
          startDate: toOmrsIsoString(new Date()),
        })
          .then(() =>
            showToast({
              title: 'Successfully added',
              kind: 'success',
              description: `Patient added to ${patientListsObj[patientListUuid].name} list successfully.`,
            }),
          )
          .catch(() =>
            showToast({
              title: 'Error',
              kind: 'error',
              description: `Patient not added to ${patientListsObj[patientListUuid].name} list.`,
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
        setPage(1);
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
    goTo(page);
  }, [page]);

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
          {!loading && patientListsObj && results ? (
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
              <p className={styles.bodyLong01}>No patient list found</p>
            )
          ) : (
            <SkeletonText />
          )}
        </fieldset>
      </div>
      {paginated && (
        <div className={styles.paginationContainer}>
          <span className={`${styles.itemsCountDisplay} ${styles.bodyLong01}`}>
            {results.length * currentPage} / {searchResults.length} items
          </span>
          <Pagination
            className={styles.pagination}
            forwardText=""
            backwardText=""
            page={currentPage}
            pageSize={5}
            pageSizes={[5]}
            totalItems={searchResults.length}
            onChange={({ page }) => setPage(page)}
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
