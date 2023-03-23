import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTableHeader, Tab, Tabs, TabList, TabPanels, TabPanel } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { ErrorState, ExtensionSlot, navigate, useConfig } from '@openmrs/esm-framework';
import { useAllPatientLists } from '../api/hooks';
import { PatientList, PatientListFilter, PatientListType } from '../api/types';
import CreateNewList from '../create-edit-patient-list/create-edit-list.component';
import PatientListTable from './patient-list-table.component';
import styles from './patient-list-list.scss';
import { useLocation } from 'react-router-dom';
import { ConfigSchema } from '../config-schema';

const TabIndices = {
  STARRED_LISTS: 0,
  SYSTEM_LISTS: 1,
  MY_LISTS: 2,
  ALL_LISTS: 3,
} as const;

const headersWithoutType: Array<DataTableHeader<keyof PatientList>> = [
  { key: 'display', header: 'List Name' },
  { key: 'size', header: 'No. Patients' },
  { key: 'isStarred', header: '' },
];

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
  const config = useConfig() as ConfigSchema;
  const [selectedTab, setSelectedTab] = useState<number>(TabIndices.STARRED_LISTS);
  const [searchString, setSearchString] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(config.patientListsToShow);
  const patientListFilter = usePatientListFilterForCurrentTab(selectedTab, searchString);
  const { patientLists, isLoading, isValidating, error, mutate, totalResults } = useAllPatientLists(
    patientListFilter,
    page,
    pageSize,
  );
  const { search } = useLocation();
  const createNewList =
    Object.fromEntries(
      search
        .slice(1)
        .split('&')
        ?.map((searchParam) => searchParam?.split('=')),
    )['new_cohort'] === 'true';

  // URL navigation is in place to know either to open the create list overlay or not
  // The url /patient-list?new_cohort=true is being used in the "Add patient to list" widget
  // in the patient chart. The button in the above mentioned widget "Create new list", navigates
  // to /patient-list?new_cohort=true to open the overlay directly.
  const handleShowNewListOverlay = () => {
    navigate({
      to: '${openmrsSpaBase}/patient-list?new_cohort=true',
    });
  };

  const handleHideNewListOverlay = () => {
    navigate({
      to: '${openmrsSpaBase}/patient-list',
    });
  };

  const handleSearch = (str) => {
    setPage(1);
    setSearchString(str);
  };

  const tableHeaders = [
    { id: 1, key: 'display', header: t('listName', 'List name') },
    { id: 2, key: 'type', header: t('listType', 'List type') },
    { id: 3, key: 'size', header: t('noOfPatients', 'No. of patients') },
    { id: 4, key: 'isStarred', header: '' },
  ];

  return (
    <main className={`omrs-main-content ${styles.patientListListPage}`}>
      <section className={styles.patientListList}>
        <ExtensionSlot extensionSlotName="breadcrumbs-slot" className={styles.breadcrumbsSlot} />
        <div className={styles.patientListHeader}>
          <h2 className={styles.productiveHeading03}>{t('patientLists', 'Patient Lists')}</h2>
          <Button
            className={styles.newListButton}
            kind="ghost"
            renderIcon={(props) => <Add {...props} size={16} />}
            iconDescription="Add"
            onClick={handleShowNewListOverlay}>
            {t('newList', 'New List')}
          </Button>
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
          <PatientListTable
            listType={patientListFilter.label}
            loading={isLoading}
            fetching={isValidating}
            headers={tableHeaders}
            patientLists={patientLists}
            refetch={mutate}
            error={error}
            totalResults={totalResults}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            search={{
              onSearch: handleSearch,
              placeHolder: t('search', 'Search'),
              currentSearchTerm: searchString,
            }}
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
