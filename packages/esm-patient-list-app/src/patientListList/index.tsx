import React, { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import Button from 'carbon-components-react/lib/components/Button';
import Search from 'carbon-components-react/es/components/Search';
import Tab from 'carbon-components-react/es/components/Tab';
import Tabs from 'carbon-components-react/es/components/Tabs';
import PatientListTable from './PatientListTable';
import CreateNewList from './CreateNewList';
import PatientListMembersOverlay from '../PatientList';
import SearchOverlay from './SearchOverlay';
import { useTranslation } from 'react-i18next';
import { ExtensionSlot, useSessionUser } from '@openmrs/esm-framework';
import { usePatientListDataQuery, useToggleStarredMutation } from '../patientListData';
import { PatientList, PatientListFilter, PatientListType } from '../patientListData/types';
import { SearchState, StateTypes, ViewState } from './types';
import './style.scss';
import { DataTableHeader } from 'carbon-components-react/lib/components/DataTable';

enum TabTypes {
  STARRED,
  SYSTEM,
  USER,
  ALL,
}

const labelMap = ['Starred', 'System lists', 'My lists', 'All'];

const headersWithoutType: Array<DataTableHeader<keyof PatientList>> = [
  { key: 'display', header: 'List Name' },
  { key: 'memberCount', header: 'No. Patients' },
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
    <div
      style={{
        paddingTop: '48px',
        display: 'grid',
        height: '100vh',
        boxSizing: 'border-box',
        gridTemplateRows: '48px auto 1fr',
        alignContent: 'baseline',
      }}>
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" style={{ gridRow: '1 / 2', gridColumn: '1 / 2' }} />
      <div
        style={{
          gridRow: '1 / 2',
          gridColumn: '1 / 2',
          justifySelf: 'end',
          width: viewState.type === StateTypes.IDLE ? '30%' : '100%',
        }}>
        <Search
          style={{ backgroundColor: 'white', borderBottomColor: '#e0e0e0' }}
          labelText="search me"
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
              setViewState(({ searchTerm }: SearchState) => ({
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
      <div
        style={{
          gridRow: '2 / 3',
          gridColumn: '1 / 2',
          height: '100%',
          width: '100%',
          display: 'grid',
          gridTemplate: '1.5rem auto / 1fr 1fr',
          gap: '1rem',
          padding: '1rem 1rem 0rem 1rem',
          backgroundColor: 'white',
        }}>
        <p
          style={{
            height: '1.75rem',
            fontSize: '1.25rem',
            lineHeight: 1.4,
          }}>
          {t('patientLists', 'Patient Lists')}
        </p>
        <Button
          style={{ width: 'fit-content', justifySelf: 'end', alignSelf: 'center' }}
          kind="ghost"
          renderIcon={Add16}
          iconDescription="Add"
          onClick={() => setRouteState({ type: RouteStateTypes.CREATE_NEW_LIST })}>
          {t('newList', 'New List')}
        </Button>
        <Tabs
          type="container"
          style={{
            gridColumn: 'span 2',
          }}
          tabContentClassName="deactivate-tabs-content"
          onSelectionChange={setSelectedTab}>
          {createLabels()}
        </Tabs>
      </div>
      <div style={{ gridRow: '3 / 4', gridColumn: '1 / 2', height: '100%' }}>
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
    </div>
  );
};

export default PatientListList;
