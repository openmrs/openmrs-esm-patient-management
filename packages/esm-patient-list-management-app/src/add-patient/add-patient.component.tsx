import React, { useState, useEffect, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import { mutate } from 'swr';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, CheckboxSkeleton, Pagination, Search, Tile } from '@carbon/react';
import { navigate, restBaseUrl, showSnackbar, usePagination } from '@openmrs/esm-framework';
import { type AddablePatientListViewModel } from '../api/types';
import { useAddablePatientLists } from '../api/api-remote';
import styles from './add-patient.scss';

interface AddPatientProps {
  closeModal: () => void;
  patientUuid: string;
}

const AddPatient: React.FC<AddPatientProps> = ({ closeModal, patientUuid }) => {
  const { t } = useTranslation();
  const { data, isLoading } = useAddablePatientLists(patientUuid);
  const [searchValue, setSearchValue] = useState('');
  const [selected, setSelected] = useState<Array<string>>([]);

  const handleCreateNewList = useCallback(() => {
    navigate({
      to: window.getOpenmrsSpaBase() + 'home/patient-lists?new_cohort=true',
    });

    closeModal();
  }, [closeModal]);

  const handleSelectionChanged = useCallback((patientListId: string, listSelected: boolean) => {
    if (listSelected) {
      setSelected((prev) => [...prev, patientListId]);
    } else {
      setSelected((prev) => prev.filter((x) => x !== patientListId));
    }
  }, []);

  const mutateCohortMembers = useCallback(() => {
    const key = `${restBaseUrl}/cohortm/cohortmember?patient=${patientUuid}&v=custom:(uuid,patient:ref,cohort:(uuid,name,startDate,endDate))`;

    return mutate((k) => typeof k === 'string' && k === key);
  }, [patientUuid]);

  const handleSubmit = useCallback(() => {
    Promise.all(
      selected.map((selectedId) => {
        const patientList = data.find((list) => list.id === selectedId);
        if (!patientList) return Promise.resolve();

        return patientList
          .addPatient()
          .then(async () => {
            await mutateCohortMembers();
            showSnackbar({
              title: t('successfullyAdded', 'Successfully added'),
              kind: 'success',
              isLowContrast: true,
              subtitle: `${t('successAddPatientToList', 'Patient added to list')}: ${patientList.displayName}`,
            });
          })
          .catch(() => {
            showSnackbar({
              title: t('error', 'Error'),
              kind: 'error',
              subtitle: `${t('errorAddPatientToList', 'Patient not added to list')}: ${patientList.displayName}`,
            });
          });
      }),
    ).finally(closeModal);
  }, [selected, closeModal, data, mutateCohortMembers, t]);

  const searchResults = useMemo(() => {
    if (!data) {
      return [];
    }

    if (searchValue?.trim().length > 0) {
      const search = searchValue.toLowerCase();
      return data.filter((patientList) => patientList.displayName.toLowerCase().includes(search));
    }

    return data;
  }, [searchValue, data]);

  const { results, goTo, currentPage, paginated } = usePagination<AddablePatientListViewModel>(searchResults, 5);

  useEffect(() => {
    if (currentPage !== 1) {
      goTo(1);
    }
  }, [currentPage, goTo, searchValue]);

  return (
    <div className={styles.modalContent}>
      <div className={styles.modalHeader}>
        <h1 className={styles.header}>{t('addPatientToList', 'Add patient to list')}</h1>
        <h3 className={styles.subheader}>
          {t('searchForAListToAddThisPatientTo', 'Search for a list to add this patient to.')}
        </h3>
      </div>
      <Search
        className={styles.search}
        labelText={t('searchForList', 'Search for a list')}
        placeholder={t('searchForList', 'Search for a list')}
        onChange={({ target }) => {
          setSearchValue(target.value);
        }}
        value={searchValue}
      />
      <div className={styles.patientListList}>
        <fieldset className="cds--fieldset">
          {!isLoading && results ? (
            results.length > 0 ? (
              <>
                <p className="cds--label">{t('patientLists', 'Patient lists')}</p>
                {results.map((patientList) => (
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
                ))}
              </>
            ) : (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>{t('noMatchingListsFound', 'No matching lists found')}</p>
                    <p className={styles.actionText}>
                      <span>{t('trySearchingForADifferentList', 'Try searching for a different list')}</span>
                      <span>&mdash; or &mdash;</span>
                      <Button kind="ghost" size="sm" onClick={handleCreateNewList}>
                        {t('createNewPatientList', 'Create new patient list')}
                      </Button>
                    </p>
                  </div>
                </Tile>
              </div>
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
          <span className={classNames(styles.itemsCountDisplay, styles.bodyLong01)}>
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
        <Button className={styles.createButton} kind="ghost" size="xl" onClick={handleCreateNewList}>
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

export default AddPatient;
