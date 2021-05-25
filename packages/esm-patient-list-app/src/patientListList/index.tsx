import React from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import Button from 'carbon-components-react/lib/components/Button';
import { ExtensionSlot } from '@openmrs/esm-framework';

import { getAllPatientLists, updatePatientListDetails, usePatientListData } from '../patientListData';
import { Search, Tab, Tabs } from 'carbon-components-react';
import PatientListTable from './patientListTable';
import PatientListResults from './PatientListResults';
import { PATIENT_LIST_TYPE } from '../patientListData/types';
import './style.scss';
import CreateNewList from './CreateNewList';
import PatientList from '../PatientList';

enum StateTypes {
  IDLE,
  SEARCH,
  SEARCH_WITH_RESULTS,
}

enum TabTypes {
  STARRED,
  SYSTEM,
  USER,
  ALL,
}

const labelMap = ['Starred', 'System lists', 'My lists', 'All'];

interface IdleState {
  type: StateTypes.IDLE;
}
interface SearchState {
  type: StateTypes.SEARCH;
  searchTerm: string;
}
interface SearchStateWithResults extends Omit<SearchState, 'type'> {
  type: StateTypes.SEARCH_WITH_RESULTS;
  results: Array<any>;
  enter: Object;
}

type ViewState = IdleState | SearchState | SearchStateWithResults;

const headersWithoutType = [
  { key: 'display', header: 'List Name' },
  { key: 'memberCount', header: 'No. Patients' },
  { key: 'isStarred', header: '' },
];

const deducePatientFilter = (tabState: TabTypes): Parameters<typeof getAllPatientLists> => {
  switch (tabState) {
    case TabTypes.STARRED:
      return [undefined, true, undefined];

    case TabTypes.SYSTEM:
      return [PATIENT_LIST_TYPE.SYSTEM, undefined, undefined];

    case TabTypes.USER:
      return [PATIENT_LIST_TYPE.USER, undefined, undefined];

    case TabTypes.ALL:
    default:
      return [undefined, undefined, undefined];
  }
};

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
  const [changed, setChanged] = React.useState(false);
  const [routeState, setRouteState] = React.useState<RouteState>({ type: RouteStateTypes.ALL_LISTS });
  const [tabState, setTabState] = React.useState(TabTypes.STARRED);
  const [viewState, setViewState] = React.useState<ViewState>({ type: StateTypes.IDLE });
  const ref = React.useRef<Search & { input: HTMLInputElement }>();
  const patientFilter = React.useMemo(() => deducePatientFilter(tabState), [tabState]);
  const { data: patientData, loading } = usePatientListData(changed, ...patientFilter);

  const customHeaders = React.useMemo(
    () => (tabState === TabTypes.SYSTEM || tabState === TabTypes.USER ? headersWithoutType : undefined),
    [tabState === TabTypes.SYSTEM || tabState === TabTypes.USER],
  );

  const setListStarred = React.useCallback((listUuid: string, star: boolean) => {
    updatePatientListDetails(listUuid, { isStarred: star }).then(() => setChanged((c) => !c));
  }, []);

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
          onFocus={() => {
            if (viewState.type === StateTypes.IDLE) setViewState({ type: StateTypes.SEARCH, searchTerm: '' });
          }}
          onBlur={() => {
            if (
              viewState.type === StateTypes.SEARCH ||
              (viewState.type === StateTypes.SEARCH_WITH_RESULTS && viewState.searchTerm === '')
            )
              setViewState({ type: StateTypes.IDLE });
          }}
          onChange={({ target }) => {
            if (target !== ref.current?.input) {
              setTimeout(() => {
                ref.current.input.blur();
              }, 0);
              setViewState({ type: StateTypes.IDLE });
            } else {
              setViewState((s) => ({ ...s, searchTerm: target.value }));
            }
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter')
              setViewState(({ searchTerm }: SearchState) => ({
                type: StateTypes.SEARCH_WITH_RESULTS,
                searchTerm,
                results: ['todo'],
                enter: {},
              }));
          }}
          ref={ref}
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
          Patient Lists
        </p>
        <Button
          style={{ width: 'fit-content', justifySelf: 'end', alignSelf: 'center' }}
          kind="ghost"
          renderIcon={Add16}
          onClick={() => setRouteState({ type: RouteStateTypes.CREATE_NEW_LIST })}>
          New List
        </Button>
        <Tabs
          type="container"
          style={{
            gridColumn: 'span 2',
          }}
          tabContentClassName={'deactivate-tabs-content'}
          onSelectionChange={setTabState}>
          {(() => {
            const res = [];
            for (let index = 0; index < Object.keys(TabTypes).length / 2; index++) {
              res.push(<Tab label={labelMap[index]} id={'tab-' + index}></Tab>);
            }
            return res;
          })()}
        </Tabs>
      </div>
      <div style={{ gridRow: '3 / 4', gridColumn: '1 / 2', height: '100%' }}>
        <PatientListTable
          loading={loading}
          headers={customHeaders}
          patientData={patientData}
          setListStarred={setListStarred}
          openPatientList={(listUuid) => {
            setRouteState({ type: RouteStateTypes.SINGLE_LIST, listUuid });
          }}
        />
      </div>
      {(() => {
        switch (viewState.type) {
          case StateTypes.SEARCH:
            return (
              <div
                style={{
                  zIndex: 1,
                  gridRow: '2 / 4',
                  gridColumn: '1 / 2',
                  backgroundColor: 'grey',
                  opacity: 0.7,
                }}></div>
            );
          case StateTypes.SEARCH_WITH_RESULTS:
            return (
              <PatientListResults
                style={{ zIndex: 1, gridRow: '2 / 4', gridColumn: '1 / 2', backgroundColor: '#ededed' }}
                nameFilter={viewState.searchTerm}
                setListStarred={setListStarred}
                enter={viewState.enter}
                openPatientList={(listUuid) => {
                  setRouteState({ type: RouteStateTypes.SINGLE_LIST, listUuid });
                }}
              />
            );
          case StateTypes.IDLE:
          default:
            return null;
        }
      })()}
      {routeState.type === RouteStateTypes.CREATE_NEW_LIST && (
        <CreateNewList
          close={() => setRouteState({ type: RouteStateTypes.ALL_LISTS })}
          finished={() => setChanged((c) => !c)}
        />
      )}
      {routeState.type === RouteStateTypes.SINGLE_LIST && (
        <PatientList
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
