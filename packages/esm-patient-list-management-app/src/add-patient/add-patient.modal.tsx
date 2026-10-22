import React, { useState, useEffect, useMemo, useCallback } from 'react';
import classNames from 'classnames';
import { useSWRConfig } from 'swr';
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
  InlineNotification,
} from '@carbon/react';
import {
  getCoreTranslation,
  launchWorkspace2,
  restBaseUrl,
  showModal,
  showSnackbar,
  useConfig,
  usePagination,
} from '@openmrs/esm-framework';
import { type AddablePatientListViewModel } from '../api/types';
import { useAddablePatientLists, getPatientLocationFromIdentifiers } from '../api/patient-list.resource';
import { type PatientListManagementConfig } from '../config-schema';
import styles from './add-patient.scss';

interface AddPatientProps {
  closeModal: () => void;
  patientUuid: string;
  /** UUIDs of lists to pre-check, e.g. the earlier selection plus a list just created from this modal. */
  preselectedListIds?: Array<string>;
}

const AddPatient: React.FC<AddPatientProps> = ({ closeModal, patientUuid, preselectedListIds }) => {
  const { t } = useTranslation();
  const config = useConfig<PatientListManagementConfig>();
  const { data, isLoading } = useAddablePatientLists(patientUuid);
  const [searchValue, setSearchValue] = useState('');
  const [selected, setSelected] = useState<Array<string>>(preselectedListIds ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patientLocation, setPatientLocation] = useState<{ uuid: string; display: string } | null>(null);
  const [locationFetchError, setLocationFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (config.enforcePatientListLocationMatch) {
      getPatientLocationFromIdentifiers(patientUuid).then((location) => {
        setPatientLocation(location);
        if (!location && config.enforcePatientListLocationMatch) {
          setLocationFetchError(
            t(
              'patientLocationNotFound',
              'Could not determine patient location from identifiers. Location validation may fail.',
            ),
          );
        }
      });
    }
  }, [patientUuid, config.enforcePatientListLocationMatch, t]);

  const { mutate } = useSWRConfig();

  const handleCreateNewList = useCallback(() => {
    const reopenModal = (listIds: Array<string>) => {
      const dispose = showModal('add-patient-to-patient-list-modal', {
        closeModal: () => dispose(),
        patientUuid,
        preselectedListIds: listIds,
        size: 'sm',
      });
    };

    closeModal();

    // No window or group props are passed on purpose: the chart's workspace group is already open,
    // and null props count as compatible with it, so open chart work (e.g. an unsaved vitals draft)
    // is left alone and no discard prompt appears.
    Promise.resolve(
      launchWorkspace2('patient-list-form-chart-workspace', {
        onSuccess: async (createdListUuid?: string) => {
          // Refresh the addable lists so the new list is present when the modal reopens
          await mutate(['addablePatientLists', patientUuid]);
          reopenModal(createdListUuid ? [createdListUuid, ...selected] : selected);
        },
      }),
    )
      .then((launched) => {
        // The user declined a close prompt, so the form never opened: restore the selection modal
        if (launched === false) {
          reopenModal(selected);
        }
      })
      .catch((error) => {
        console.error('Unable to open the create patient list form', error);
        reopenModal(selected);
      });
  }, [closeModal, mutate, patientUuid, selected]);

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
  }, [mutate, patientUuid]);

  const handleSubmit = useCallback(() => {
    const missingListIds = selected.filter((id) => !data?.some((list) => list.id === id));
    if (missingListIds.length > 0) {
      showSnackbar({
        title: t('error', 'Error'),
        kind: 'error',
        subtitle: t(
          'errorSelectedListNotLoaded',
          'The selected list could not be loaded. Close this window and try again.',
        ),
      });
      return;
    }

    setIsSubmitting(true);
    Promise.all(
      selected.map((selectedId) => {
        const patientList = data.find((list) => list.id === selectedId);
        if (!patientList) return Promise.resolve();

        if (config.enforcePatientListLocationMatch) {
          if (patientList.location) {
            const patientLocationUuid = patientLocation?.uuid;
            const listLocationUuid = patientList.location.uuid;

            if (patientLocationUuid && patientLocationUuid !== listLocationUuid) {
              showSnackbar({
                title: t('error', 'Error'),
                kind: 'error',
                subtitle: t(
                  'patientLocationMismatchWithListNameError',
                  `Patient location does not match list location. Patient cannot be added to: {{listName}}`,
                  { listName: patientList.displayName },
                ),
              });
              return Promise.resolve();
            }
          }
        }

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
  }, [selected, closeModal, data, mutateCohortMembers, t, config.enforcePatientListLocationMatch, patientLocation]);

  // Preselected lists come first (the new list, then earlier selections) so they stay on the first page
  const orderedLists = useMemo(() => {
    if (!data) {
      return [];
    }

    if (!preselectedListIds?.length) {
      return data;
    }

    const preselectedLists = preselectedListIds
      .map((listId) => data.find((list) => list.id === listId))
      .filter((list): list is AddablePatientListViewModel => Boolean(list));
    const otherLists = data.filter((list) => !preselectedListIds.includes(list.id));

    return [...preselectedLists, ...otherLists];
  }, [data, preselectedListIds]);

  const searchResults = useMemo(() => {
    if (searchValue?.trim().length > 0) {
      const search = searchValue.toLowerCase();
      return orderedLists.filter((patientList) => patientList.displayName.toLowerCase().includes(search));
    }

    return orderedLists;
  }, [searchValue, orderedLists]);

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
        {locationFetchError && (
          <InlineNotification
            kind="warning"
            title={t('warning', 'Warning')}
            subtitle={locationFetchError}
            hideCloseButton={true}
            style={{ marginBottom: '1rem' }}
          />
        )}
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
