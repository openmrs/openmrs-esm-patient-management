import React, { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Tab, Tabs, TabList } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { ExtensionSlot, navigate } from '@openmrs/esm-framework';
import { useAllPatientLists } from '../api/hooks';
import { PatientListFilter, PatientListType } from '../api/types';
import CreateNewList from '../create-edit-patient-list/create-edit-list.component';
import Illustration from '../illo';
import PatientListTableContainer from './patient-list-table.component';
import styles from './patient-list-list.scss';

export const TabIndices = {
  STARRED_LISTS: 0,
  SYSTEM_LISTS: 1,
  MY_LISTS: 2,
  ALL_LISTS: 3,
} as const;

function usePatientListFilterForCurrentTab(selectedTab: number, search: string) {
  const { t } = useTranslation();
  return useMemo<PatientListFilter>(() => {
    switch (selectedTab) {
      case TabIndices.STARRED_LISTS:
        return { isStarred: true, name: search, label: t('starred', 'starred') };
      case TabIndices.SYSTEM_LISTS:
        return { type: PatientListType.SYSTEM, name: search, label: t('systemDefined', 'system-defined') };
      case TabIndices.MY_LISTS:
        return { type: PatientListType.USER, name: search, label: t('userDefined', 'user-defined') };
      case TabIndices.ALL_LISTS:
      default:
        return { name: search, label: '' };
    }
  }, [selectedTab, search, t]);
}

const PatientListList: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<number>(TabIndices.STARRED_LISTS);
  const [searchTerms, setSearchTerms] = useState({
    [TabIndices.STARRED_LISTS]: '',
    [TabIndices.SYSTEM_LISTS]: '',
    [TabIndices.MY_LISTS]: '',
    [TabIndices.ALL_LISTS]: '',
  });
  const currentSearchTerm = searchTerms[selectedTab];
  const patientListFilter = usePatientListFilterForCurrentTab(selectedTab, currentSearchTerm);
  const { patientLists, isLoading, isValidating, error, mutate } = useAllPatientLists(patientListFilter);
  const { search } = useLocation();
  const createNewList =
    Object.fromEntries(
      search
        .slice(1)
        .split('&')
        ?.map((searchParam) => searchParam?.split('=')),
    )['new_cohort'] === 'true';

  const showCohortType = selectedTab === TabIndices.ALL_LISTS || selectedTab === TabIndices.STARRED_LISTS;

  // URL navigation is in place to know either to open the create list overlay or not
  // The url /patient-list?new_cohort=true is being used in the "Add patient to list" widget
  // in the patient chart. The button in the above mentioned widget "Create new list", navigates
  // to /patient-list?new_cohort=true to open the overlay directly.
  const handleShowNewListOverlay = () => {
    navigate({
      to: '${openmrsSpaBase}/home/patient-lists?new_cohort=true',
    });
  };

  const handleHideNewListOverlay = () => {
    navigate({
      to: '${openmrsSpaBase}/home/patient-lists',
    });
  };

  const tableHeaders = showCohortType
    ? [
        { id: 1, key: 'display', header: t('listName', 'List name') },
        { id: 2, key: 'type', header: t('listType', 'List type') },
        { id: 3, key: 'size', header: t('noOfPatients', 'No. of patients') },
        { id: 4, key: 'isStarred', header: '' },
      ]
    : [
        { id: 1, key: 'display', header: t('listName', 'List name') },
        { id: 3, key: 'size', header: t('noOfPatients', 'No. of patients') },
        { id: 4, key: 'isStarred', header: '' },
      ];

  return (
    <main className={`omrs-main-content ${styles.patientListListPage}`}>
      <section className={styles.patientListList}>
        <ExtensionSlot extensionSlotName="breadcrumbs-slot" className={styles.breadcrumbsSlot} />
        <div className={styles.patientListHeader}>
          <div className={styles.leftJustifiedItems}>
            <Illustration />
            <div className={styles.pageLabels}>
              <p>{t('patientLists', 'Patient lists')}</p>
              <p className={styles.pageName}>{t('home', 'Home')}</p>
            </div>
          </div>
          <div className={styles.rightJustifiedItems}>
            <Button
              className={styles.newListButton}
              kind="ghost"
              renderIcon={(props) => <Add {...props} size={16} />}
              iconDescription="Add"
              onClick={handleShowNewListOverlay}>
              {t('newList', 'New list')}
            </Button>
          </div>
        </div>
        <Tabs
          className={styles.tabs}
          tabContentClassName={styles.hiddenTabsContent}
          selectedIndex={selectedTab}
          onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}>
          <TabList className={styles.tablist} aria-label="List tabs" contained>
            <Tab className={styles.tab}>{t('starredLists', 'Starred lists')}</Tab>
            <Tab className={styles.tab}>{t('systemLists', 'System lists')}</Tab>
            <Tab className={styles.tab}>{t('myLists', 'My lists')}</Tab>
            <Tab className={styles.tab}>{t('allLists', 'All lists')}</Tab>
          </TabList>
        </Tabs>
        <div className={styles.patientListTableContainer}>
          <PatientListTableContainer
            listType={patientListFilter.label}
            loading={isLoading}
            isValidating={isValidating}
            headers={tableHeaders}
            patientLists={patientLists}
            searchTerms={searchTerms}
            selectedTab={selectedTab}
            setSearchTerms={setSearchTerms}
            refetch={mutate}
            error={error}
          />
        </div>
      </section>
      <section>
        {createNewList && <CreateNewList close={handleHideNewListOverlay} onSuccess={() => mutate()} />}
      </section>
    </main>
  );
};

export default PatientListList;
