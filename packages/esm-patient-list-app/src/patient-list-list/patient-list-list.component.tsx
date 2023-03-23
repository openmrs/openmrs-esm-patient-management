import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTableHeader, Tab, Tabs, TabList, TabPanels, TabPanel } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { ExtensionSlot, navigate } from '@openmrs/esm-framework';
import { useAllPatientLists } from '../api/hooks';
import { PatientList, PatientListFilter, PatientListType } from '../api/types';
import CreateNewList from '../create-edit-patient-list/create-edit-list.component';
import PatientListTable from './patient-list-table.component';
import styles from './patient-list-list.scss';
import { useLocation } from 'react-router-dom';

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
  return useMemo<PatientListFilter>(() => {
    switch (selectedTab) {
      case TabIndices.STARRED_LISTS:
        return { isStarred: true, name: search };
      case TabIndices.SYSTEM_LISTS:
        return { type: PatientListType.SYSTEM, name: search };
      case TabIndices.MY_LISTS:
        return { type: PatientListType.USER, name: search };
      case TabIndices.ALL_LISTS:
      default:
        return { name: search };
    }
  }, [selectedTab, search]);
}

const PatientListList: React.FC = () => {
  const { t } = useTranslation();
  const [selectedTab, setSelectedTab] = useState<number>(TabIndices.STARRED_LISTS);
  const [searchString, setSearchString] = useState('');
  const patientListFilter = usePatientListFilterForCurrentTab(selectedTab, searchString);
  const patientListQuery = useAllPatientLists(patientListFilter);
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

  const handleSearch = (str) => setSearchString(str);

  const tableHeaders = [
    { id: 1, key: 'display', header: t('listName', 'List name') },
    { id: 2, key: 'type', header: t('listType', 'List type') },
    { id: 3, key: 'size', header: t('noOfPatients', 'No. of patients') },
    { id: 4, key: 'isStarred', header: '' },
  ];

  if (patientListQuery.error) {
    // TODO: Propagate error to the PatientListTable component and render an error state. Requires reworking API hooks.
    return null;
  }

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
          <div className={styles.patientListTableContainer}>
            <TabPanels>
              <TabPanel style={{ padding: 0 }}>
                <PatientListTable
                  listType={t('starred', 'starred')}
                  loading={!patientListQuery.data}
                  fetching={patientListQuery.isValidating}
                  headers={tableHeaders}
                  patientLists={patientListQuery?.data?.filter((d) => d.isStarred)}
                  refetch={patientListQuery.mutate}
                  search={{
                    onSearch: handleSearch,
                    placeHolder: t('search', 'Search'),
                    currentSearchTerm: searchString,
                  }}
                />
              </TabPanel>
              <TabPanel style={{ padding: 0 }}>
                <PatientListTable
                  listType={t('systemDefined', 'system-defined')}
                  loading={!patientListQuery.data}
                  fetching={patientListQuery.isValidating}
                  headers={tableHeaders}
                  patientLists={patientListQuery?.data?.filter((d) => d.type === 'System List')}
                  refetch={patientListQuery.mutate}
                  search={{
                    onSearch: handleSearch,
                    placeHolder: t('search', 'Search'),
                    currentSearchTerm: searchString,
                  }}
                />
              </TabPanel>
              <TabPanel style={{ padding: 0 }}>
                <PatientListTable
                  listType={t('userDefined', 'user-defined')}
                  loading={!patientListQuery.data}
                  fetching={patientListQuery.isValidating}
                  headers={tableHeaders}
                  patientLists={patientListQuery?.data?.filter((d) => d.type === 'My List')}
                  refetch={patientListQuery.mutate}
                  search={{
                    onSearch: handleSearch,
                    placeHolder: t('search', 'Search'),
                    currentSearchTerm: searchString,
                  }}
                  handleCreate={handleShowNewListOverlay}
                />
              </TabPanel>
              <TabPanel style={{ padding: 0 }}>
                <PatientListTable
                  listType={''}
                  loading={!patientListQuery.data}
                  fetching={patientListQuery.isValidating}
                  headers={tableHeaders}
                  patientLists={patientListQuery?.data}
                  refetch={patientListQuery.mutate}
                  search={{
                    onSearch: handleSearch,
                    placeHolder: t('search', 'Search'),
                    currentSearchTerm: searchString,
                  }}
                  handleCreate={handleShowNewListOverlay}
                />
              </TabPanel>
            </TabPanels>
          </div>
        </Tabs>
      </section>
      <section>
        {createNewList && (
          <CreateNewList close={handleHideNewListOverlay} onSuccess={() => patientListQuery.mutate()} />
        )}
      </section>
    </main>
  );
};

export default PatientListList;
