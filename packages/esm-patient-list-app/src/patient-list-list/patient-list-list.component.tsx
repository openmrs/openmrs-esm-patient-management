import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, DataTableHeader, Tab, Tabs, TabList, TabPanels, TabPanel } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { useAllPatientLists } from '../api/hooks';
import { PatientList, PatientListFilter, PatientListType } from '../api/types';
import CreateNewList from '../create-edit-patient-list/create-edit-list.component';
import PatientListTable from './patient-list-table.component';
import styles from './patient-list-list.scss';

enum TabTypes {
  Starred,
  'System List',
  'My List',
  All,
}

const headersWithoutType: Array<DataTableHeader<keyof PatientList>> = [
  { key: 'display', header: 'List Name' },
  { key: 'size', header: 'No. Patients' },
  { key: 'isStarred', header: '' },
];

function usePatientListFilterForCurrentTab(selectedTab: TabTypes, search: string) {
  return useMemo<PatientListFilter>(() => {
    switch (selectedTab) {
      case TabTypes.Starred:
        return { isStarred: true, name: search };
      case TabTypes['System Lists']:
        return { type: PatientListType.SYSTEM, name: search };
      case TabTypes['My Lists']:
        return { type: PatientListType.USER, name: search };
      case TabTypes.All:
      default:
        return { name: search };
    }
  }, [selectedTab, search]);
}

function useAppropriateTableHeadersForSelectedTab(selectedTab: TabTypes) {
  return useMemo(
    () =>
      selectedTab === TabTypes['System List'] || selectedTab === TabTypes['My List'] ? headersWithoutType : undefined,
    [selectedTab],
  );
}

enum RouteStateTypes {
  ALL_LISTS,
  CREATE_NEW_LIST,
}

interface AllListRouteState {
  type: RouteStateTypes.ALL_LISTS;
}

interface CreateNewListState {
  type: RouteStateTypes.CREATE_NEW_LIST;
}

type RouteState = AllListRouteState | CreateNewListState;

const PatientListList: React.FC = () => {
  const { t } = useTranslation();
  const [routeState, setRouteState] = useState<RouteState>({ type: RouteStateTypes.ALL_LISTS });
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchString, setSearchString] = useState<string>('');
  const patientListFilter = usePatientListFilterForCurrentTab(selectedTab, searchString);
  const customHeaders = useAppropriateTableHeadersForSelectedTab(selectedTab);
  const patientListQuery = useAllPatientLists(patientListFilter);

  const handleSearch = (str) => setSearchString(str);

  if (patientListQuery.error) {
    //TODO show toast with error
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
            onClick={() => setRouteState({ type: RouteStateTypes.CREATE_NEW_LIST })}>
            {t('newList', 'New List')}
          </Button>
        </div>
        <Tabs
          className={styles.tabs}
          tabContentClassName={styles.hiddenTabsContent}
          selectedIndex={selectedTab}
          onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}>
          <TabList aria-label="List tabs" contained>
            <Tab>{t('starred', 'Starred')}</Tab>
            <Tab>{t('systemList', 'System List')}</Tab>
            <Tab>{t('myList', 'My List')}</Tab>
            <Tab>{t('all', 'All')}</Tab>
          </TabList>
          <div className={styles.patientListTableContainer}>
            <TabPanels>
              <TabPanel style={{ padding: 0 }}>
                <PatientListTable
                  listType={TabTypes[selectedTab]}
                  loading={!patientListQuery.data}
                  fetching={patientListQuery.isValidating}
                  headers={customHeaders}
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
                  listType={TabTypes[selectedTab]}
                  loading={!patientListQuery.data}
                  fetching={patientListQuery.isValidating}
                  headers={customHeaders}
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
                  listType={TabTypes[selectedTab]}
                  loading={!patientListQuery.data}
                  fetching={patientListQuery.isValidating}
                  headers={customHeaders}
                  patientLists={patientListQuery?.data?.filter((d) => d.type === 'My List')}
                  refetch={patientListQuery.mutate}
                  search={{
                    onSearch: handleSearch,
                    placeHolder: t('search', 'Search'),
                    currentSearchTerm: searchString,
                  }}
                  handleCreate={() => setRouteState({ type: RouteStateTypes.CREATE_NEW_LIST })}
                />
              </TabPanel>
              <TabPanel style={{ padding: 0 }}>
                <PatientListTable
                  listType={TabTypes[selectedTab]}
                  loading={!patientListQuery.data}
                  fetching={patientListQuery.isValidating}
                  headers={customHeaders}
                  patientLists={patientListQuery?.data}
                  refetch={patientListQuery.mutate}
                  search={{
                    onSearch: handleSearch,
                    placeHolder: t('search', 'Search'),
                    currentSearchTerm: searchString,
                  }}
                  handleCreate={() => setRouteState({ type: RouteStateTypes.CREATE_NEW_LIST })}
                />
              </TabPanel>
            </TabPanels>
          </div>
        </Tabs>
      </section>
      <section>
        {routeState.type === RouteStateTypes.CREATE_NEW_LIST && (
          <CreateNewList
            close={() => setRouteState({ type: RouteStateTypes.ALL_LISTS })}
            onSuccess={() => patientListQuery.mutate()}
          />
        )}
      </section>
    </main>
  );
};

export default PatientListList;
