import React, { useState, useEffect, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import { mutate } from 'swr';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Checkbox,
  CheckboxSkeleton,
  InlineLoading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Pagination,
  Search,
  Tile,
} from '@carbon/react';
import { getCoreTranslation, navigate, restBaseUrl, showSnackbar, usePagination } from '@openmrs/esm-framework';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
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
    ).finally(() => {
      setIsSubmitting(false);
      closeModal();
    });
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
    if (searchValue) {
      goTo(1);
    }
  }, [goTo, searchValue]);

  const startIndex = (currentPage - 1) * 5 + 1;
  const endIndex = Math.min(currentPage * 5, searchResults.length);

  return (
    <div className={styles.container}>
      <ModalHeader closeModal={closeModal} title={t('addPatientToList', 'Add patient to list')}>
        <h3 className={styles.subheader}>
          {t('searchForAListToAddThisPatientTo', 'Search for a list to add this patient to.')}
        </h3>
      </ModalHeader>
      <ModalBody>
        <Search
          className={styles.search}
          labelText={t('searchForList', 'Search for a list')}
          placeholder={t('searchForList', 'Search for a list')}
          onChange={({ target }) => setSearchValue(target.value)}
          size="lg"
          value={searchValue}
        />
        <fieldset className={classNames('cds--fieldset', styles.fieldset)}>
          {!isLoading && results ? (
            results.length > 0 ? (
              <>
                <p className="cds--label">{t('patientLists', 'Patient lists')}</p>
                {results.map((patientList) => (
                  <div key={patientList.id} className={styles.checkbox}>
                    <Checkbox
                      checked={patientList.checked || selected.includes(patientList.id)}
                      disabled={patientList.checked}
                      id={patientList.id}
                      key={patientList.id}
                      labelText={patientList.displayName}
                      onChange={(e) => handleSelectionChanged(patientList.id, e.target.checked)}
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
      </ModalBody>
      {paginated && (
        <div className={styles.paginationContainer}>
          <span className={classNames(styles.itemsCountDisplay, styles.bodyLong01)}>
            {searchResults.length > 0 ? `${startIndex}-${endIndex} / ${searchResults.length}` : '0'}{' '}
            {t('items', 'items')}
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
      <ModalFooter className={styles.buttonSet}>
        <Button kind="ghost" onClick={handleCreateNewList} size="xl">
          {t('createNewPatientList', 'Create new patient list')}
        </Button>
        <div>
          <Button kind="secondary" onClick={closeModal} size="xl">
            {t('cancel', 'Cancel')}
          </Button>
          <Button disabled={selected.length === 0 || isSubmitting} onClick={handleSubmit} size="xl">
            {isSubmitting ? (
              <InlineLoading description={t('saving', 'Saving') + '...'} />
            ) : (
              <span>{getCoreTranslation('save', 'Save')}</span>
            )}
          </Button>
        </div>
      </ModalFooter>
    </div>
  );
};

export default AddPatient;
