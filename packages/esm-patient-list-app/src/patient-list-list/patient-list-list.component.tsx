import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Tab, Tabs, TabList, TabPanels, TabPanel } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { useAllPatientLists } from '../api/hooks';
import { PatientListFilter, PatientListType } from '../api/types';
import CreateNewList from '../create-edit-patient-list/create-edit-list.component';
import PatientListTable from './patient-list-table.component';
import SearchComponent from './patient-list-search.component';
import styles from './patient-list-list.scss';

export const TabIndices = {
  STARRED_LISTS: 0,
  SYSTEM_LISTS: 1,
  MY_LISTS: 2,
  ALL_LISTS: 3,
} as const;

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
        return { name: search };
      default:
    }
  }, [selectedTab, search]);
}

const PatientListList: React.FC = () => {
  const { t } = useTranslation();
  const [routeState, setRouteState] = useState<RouteState>({ type: RouteStateTypes.ALL_LISTS });
  const [selectedTab, setSelectedTab] = useState<number>(TabIndices.STARRED_LISTS);
  const [searchTerms, setSearchTerms] = useState({
    [TabIndices.STARRED_LISTS]: '',
    [TabIndices.SYSTEM_LISTS]: '',
    [TabIndices.MY_LISTS]: '',
    [TabIndices.ALL_LISTS]: '',
  });

  const handleSearch = (searchTerm: string) => {
    setSearchTerms({
      ...searchTerms,
      [selectedTab]: searchTerm,
    });
  };

  const currentSearchTerm = searchTerms[selectedTab];

  const patientListFilter = usePatientListFilterForCurrentTab(selectedTab, currentSearchTerm);
  const patientListQuery = useAllPatientLists(patientListFilter);

  const tableHeaders = [
    { id: 1, key: 'display', header: t('listName', 'List name') },
    { id: 2, key: 'type', header: t('listType', 'List type') },
    { id: 3, key: 'size', header: t('noOfPatients', 'No. of patients') },
    { id: 4, key: 'isStarred', header: '' },
  ];

  const tabs = [
    { label: t('starredLists', 'Starred lists'), index: TabIndices.STARRED_LISTS },
    { label: t('systemLists', 'System lists'), index: TabIndices.SYSTEM_LISTS },
    { label: t('myLists', 'My lists'), index: TabIndices.MY_LISTS },
    { label: t('allLists', 'All lists'), index: TabIndices.ALL_LISTS },
  ];

  const tabPanelProps = [
    { listType: t('starred', 'starred'), patientList: patientListQuery?.data?.filter((d) => d.isStarred) },
    {
      listType: t('systemDefined', 'system-defined'),
      patientList: patientListQuery?.data?.filter((d) => d.type === 'System List'),
    },
    {
      listType: t('userDefined', 'user-defined'),
      patientList: patientListQuery?.data?.filter((d) => d.type === 'My List'),
      handleCreate: () => setRouteState({ type: RouteStateTypes.CREATE_NEW_LIST }),
    },
    {
      listType: t('systemDefined', 'system-defined'),
      patientList: patientListQuery?.data,
      handleCreate: () => setRouteState({ type: RouteStateTypes.CREATE_NEW_LIST }),
    },
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
            onClick={() => setRouteState({ type: RouteStateTypes.CREATE_NEW_LIST })}>
            {t('newList', 'New list')}
          </Button>
        </div>
        <Tabs
          className={styles.tabs}
          tabContentClassName={styles.hiddenTabsContent}
          selectedIndex={selectedTab}
          onChange={({ selectedIndex }) => setSelectedTab(selectedIndex)}>
          <TabList className={styles.tablist} aria-label="List tabs" contained>
            {tabs.map((tab) => (
              <Tab className={styles.tab} key={tab.index}>
                {tab.label}
              </Tab>
            ))}
          </TabList>
          <div className={styles.patientListTableContainer}>
            <TabPanels>
              {tabPanelProps.map(({ listType, patientList, handleCreate }) => (
                <TabPanel style={{ padding: 0 }}>
                  <SearchComponent
                    selectedTab={selectedTab}
                    onChange={handleSearch}
                    fetching={patientListQuery.isValidating}
                    search={{
                      placeHolder: t('search', 'Search'),
                      currentSearchTerm: currentSearchTerm,
                    }}
                  />
                  <PatientListTable
                    listType={listType}
                    loading={!patientListQuery.data}
                    headers={tableHeaders}
                    patientLists={patientList}
                    refetch={patientListQuery.mutate}
                    handleCreate={handleCreate}
                  />
                </TabPanel>
              ))}
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
