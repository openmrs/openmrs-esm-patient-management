import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { showToast, usePagination, navigate } from '@openmrs/esm-framework';
import { Button, Checkbox, Pagination, Search, CheckboxSkeleton } from '@carbon/react';
import styles from './add-patient.scss';
import { useAddablePatientLists } from '../api/hooks';

interface AddPatientProps {
  closeModal: () => void;
  patientUuid: string;
}

const AddPatient: React.FC<AddPatientProps> = ({ closeModal, patientUuid }) => {
  const { t } = useTranslation();
  const [searchValue, setSearchValue] = useState('');
  const [selected, setSelected] = useState<Array<string>>([]);
  const { addableLists, isLoadingLists } = useAddablePatientLists(patientUuid, searchValue);

  const handleCreateNewList = () => {
    navigate({
      to: '${openmrsSpaBase}/home/patient-lists?new_cohort=true',
    });
    closeModal();
  };

  const handleSelectionChanged = useCallback((patientListId: string, listSelected: boolean) => {
    if (listSelected) {
      setSelected((prev) => [...prev, patientListId]);
    } else {
      setSelected((prev) => prev.filter((x) => x !== patientListId));
    }
  }, []);

  const handleSubmit = useCallback(() => {
    for (const selectedId of selected) {
      const patientList = addableLists.find((list) => list.id === selectedId);
      if (!patientList) {
        continue;
      }

      patientList
        .addPatient()
        .then(() =>
          showToast({
            title: t('successfullyAdded', 'Successfully added'),
            kind: 'success',
            description: `${t('successAddPatientToList', 'Patient added to list')}: ${patientList.displayName}`,
          }),
        )
        .catch(() =>
          showToast({
            title: t('error', 'Error'),
            kind: 'error',
            description: `${t('errorAddPatientToList', 'Patient not added to list')}: ${patientList.displayName}`,
          }),
        );
    }

    closeModal();
  }, [addableLists, selected, closeModal, t]);

  const { results, goTo, currentPage, paginated } = usePagination(addableLists, 5);

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
        <fieldset className="cds--fieldset">
          <p className="cds--label">Patient Lists</p>
          {!isLoadingLists && results ? (
            results.length > 0 ? (
              results.map((patientList) => (
                <div key={patientList.id} className={styles.checkbox}>
                  <Checkbox
                    key={patientList.id}
                    onChange={(e) => handleSelectionChanged(patientList.id, e.target.checked)}
                    checked={patientList.checked || selected.includes(patientList.id)}
                    disabled={patientList.checked}
                    labelText={patientList.displayName}
                    id={patientList.id}
                  />
                </div>
              ))
            ) : (
              <p className={styles.bodyLong01}>{t('noPatientListFound', 'No patient list found')}</p>
            )
          ) : (
            <>
              <div className={styles.checkbox}>
                <CheckboxSkeleton />
              </div>
              <div className={styles.checkbox}>
                <CheckboxSkeleton />
              </div>
              <div className={styles.checkbox}>
                <CheckboxSkeleton />
              </div>
              <div className={styles.checkbox}>
                <CheckboxSkeleton />
              </div>
              <div className={styles.checkbox}>
                <CheckboxSkeleton />
              </div>
            </>
          )}
        </fieldset>
      </div>
      {paginated && (
        <div className={styles.paginationContainer}>
          <span className={`${styles.itemsCountDisplay} ${styles.bodyLong01}`}>
            {results.length * currentPage} / {addableLists.length} {t('items', 'items')}
          </span>
          <Pagination
            className={styles.pagination}
            forwardText=""
            backwardText=""
            page={currentPage}
            pageSize={5}
            pageSizes={[5]}
            totalItems={addableLists.length}
            onChange={({ page }) => goTo(page)}
          />
        </div>
      )}
      <div className={styles.buttonSet}>
        <Button kind="ghost" size="xl" onClick={handleCreateNewList}>
          {t('createNewPatientList', 'Create new patient list')}
        </Button>
        <div>
          <Button kind="secondary" size="xl" onClick={closeModal}>
            {t('cancel', 'Cancel')}
          </Button>
          <Button onClick={handleSubmit} size="xl">
            {t('addToList', 'Add to list')}
          </Button>
        </div>
      </div>
    </div>
  );
};

// This entire modal is a little bit special since it not only displays the "real" patient lists (i.e. data from
// the cohorts/backend), but also a fake patient list which doesn't really exist in the backend:
// The offline patient list.
// When a patient is added to the offline list, that patient should become available offline, i.e.
// a dynamic offline data entry must be created.
// This is why the following abstracts away the differences between the real and the fake patient lists.
// The component doesn't really care about which is which - the only thing that matters is that the
// data can be fetched and that there is an "add patient" function.

export default AddPatient;
