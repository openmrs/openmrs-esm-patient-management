import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import { Button, DataTableHeader, Search, Tab, Tabs } from 'carbon-components-react';
import PatientListTable from './patient-list-table.component';
import CreateNewList from './create-new-list.component';
import PatientListMembersOverlay from '../patient-list/patient-list-members-overlay.component';
import SearchOverlay from './search-overlay.component';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, useSessionUser } from '@openmrs/esm-framework';
import {
  usePatientListDataQuery,
  useToggleStarredMutation,
  PatientList,
  PatientListFilter,
  PatientListType,
} from '../api';
import { SearchState, StateTypes, ViewState } from './types';
import styles from './patient-list-list.scss';

enum TabTypes {
  STARRED,
  SYSTEM,
  USER,
  ALL,
}

const labelMap = ['Starred', 'System lists', 'My lists', 'All'];

const headersWithoutType: Array<DataTableHeader<keyof PatientList>> = [
  { key: 'display', header: 'List Name' },
  { key: 'size', header: 'No. Patients' },
  { key: 'isStarred', header: '' },
];

function createLabels() {
  const res: Array<ReactNode> = [];

  for (let index = 0; index < Object.keys(TabTypes).length / 2; index++) {
    res.push(<Tab label={labelMap[index]} key={index} id={'tab-' + index} />);
  }

  return res;
}

function usePatientListFilterForCurrentTab(selectedTab: TabTypes) {
  return useMemo<PatientListFilter>(() => {
    switch (selectedTab) {
      case TabTypes.STARRED:
        return { isStarred: true };
      case TabTypes.SYSTEM:
        return { type: PatientListType.SYSTEM };
      case TabTypes.USER:
        return { type: PatientListType.USER };
      case TabTypes.ALL:
      default:
        return {};
    }
  }, [selectedTab]);
}

function useAppropriateTableHeadersForSelectedTab(selectedTab: TabTypes) {
  return useMemo(
    () => (selectedTab === TabTypes.SYSTEM || selectedTab === TabTypes.USER ? headersWithoutType : undefined),
    [selectedTab],
  );
}

enum RouteStateTypes {
  ALL_LISTS,
  SINGLE_LIST,
  CREATE_NEW_LIST,
}

interface AllListRouteState {
  type: RouteStateTypes.ALL_LISTS;
}

interface CreateNewListState {
  type: RouteStateTypes.CREATE_NEW_LIST;
}

interface SingleListState {
  type: RouteStateTypes.SINGLE_LIST;
  listUuid: string;
}

type RouteState = AllListRouteState | CreateNewListState | SingleListState;

const PatientListList: React.FC = () => {
  const { t } = useTranslation();
  const [routeState, setRouteState] = useState<RouteState>({ type: RouteStateTypes.ALL_LISTS });
  const [selectedTab, setSelectedTab] = useState(TabTypes.STARRED);
  const [viewState, setViewState] = useState<ViewState>({ type: StateTypes.IDLE });
  const searchRef = useRef<Search & { input: HTMLInputElement }>();
  const patientListFilter = usePatientListFilterForCurrentTab(selectedTab);
  const userId = useSessionUser()?.user.uuid;
  const customHeaders = useAppropriateTableHeadersForSelectedTab(selectedTab);
  const patientListQuery = usePatientListDataQuery(userId, patientListFilter);
  const toggleStarredMutation = useToggleStarredMutation();

  const handleListStarred = useCallback(
    async (listUuid: string, isStarred: boolean) => {
      await toggleStarredMutation.refetch({ userId, patientListId: listUuid, isStarred });
      await patientListQuery.refetch();
    },
    [toggleStarredMutation, patientListQuery, userId],
  );

  const handleOpenPatientList = useCallback((listUuid) => {
    setRouteState({ type: RouteStateTypes.SINGLE_LIST, listUuid });
  }, []);

  if (patientListQuery.error) {
    //TODO show toast with error
    return null;
  }

  return (
    <main
      className={`omrs-main-content ${styles.patientListListContainer}`}>
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" className={styles.breadcrumbsSlot}  />
      <div
        className={styles.searchContainer}
        style={{
          width: viewState.type === StateTypes.IDLE ? '30%' : '100%'
        }}
        >
        <Search
          className={styles.search}
          labelText="Search"
          size="xl"
          onFocus={() => {
            if (viewState.type === StateTypes.IDLE) {
              setViewState({ type: StateTypes.SEARCH, searchTerm: '' });
            }
          }}
          onBlur={() => {
            if (
              viewState.type === StateTypes.SEARCH ||
              (viewState.type === StateTypes.SEARCH_WITH_RESULTS && viewState.searchTerm === '')
            ) {
              setViewState({ type: StateTypes.IDLE });
            }
          }}
          onChange={({ target }) => {
            if (target !== searchRef.current?.input) {
              setTimeout(() => {
                searchRef.current.input.blur();
              }, 0);
              setViewState({ type: StateTypes.IDLE });
            } else {
              setViewState((s) => ({ ...s, searchTerm: target.value }));
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              setViewState(({ searchTerm }) => ({
                type: StateTypes.SEARCH_WITH_RESULTS,
                searchTerm,
                results: ['todo'],
                enter: true,
              }));
            }
          }}
          ref={searchRef}
          value={(viewState as SearchState)?.searchTerm || ''}
        />
      </div>
      <div className={styles.patientListList}
        >
        <h2
          className={styles.productiveHeading03}>
          {t('patientLists', 'Patient Lists')}
        </h2>
        <Button
          className={styles.newListButton}
          kind="ghost"
          renderIcon={Add16}
          iconDescription="Add"
          onClick={() => setRouteState({ type: RouteStateTypes.CREATE_NEW_LIST })}>
          {t('newList', 'New List')}
        </Button>
        <Tabs
          className={styles.tabs}
          type="container"
          tabContentClassName={styles.hiddenTabsContent}
          onSelectionChange={setSelectedTab}>
          {createLabels()}
        </Tabs>
      </div>
      <div className={styles.patientListTableContainer}>
        <PatientListTable
          loading={patientListQuery.isFetching}
          headers={customHeaders}
          patientLists={patientListQuery.data}
          refetch={patientListQuery.refetch}
          openPatientList={handleOpenPatientList}
        />
      </div>
      <SearchOverlay viewState={viewState} openPatientList={handleOpenPatientList} setListStarred={handleListStarred} />
      {routeState.type === RouteStateTypes.CREATE_NEW_LIST && (
        <CreateNewList close={() => setRouteState({ type: RouteStateTypes.ALL_LISTS })} />
      )}
      {routeState.type === RouteStateTypes.SINGLE_LIST && (
        <PatientListMembersOverlay
          close={() => {
            setRouteState({ type: RouteStateTypes.ALL_LISTS });
          }}
          listUuid={routeState.listUuid}
        />
      )}
    </main>
  );
};

export default PatientListList;