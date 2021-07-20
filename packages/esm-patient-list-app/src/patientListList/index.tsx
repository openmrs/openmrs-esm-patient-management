import React from 'react';
import Add16 from '@carbon/icons-react/es/add/16';
import Button from 'carbon-components-react/lib/components/Button';
import Search from 'carbon-components-react/es/components/Search';
import Tab from 'carbon-components-react/es/components/Tab';
import Tabs from 'carbon-components-react/es/components/Tabs';
import PatientListTable from './patientListTable';
import CreateNewList from './CreateNewList';
import PatientList from '../PatientList';
import SearchOverlay from './SearchOverlay';
import { ExtensionSlot } from '@openmrs/esm-framework';
import { getAllPatientLists, usePatientListData } from '../patientListData';
import { PATIENT_LIST_TYPE } from '../patientListData/types';
import { SearchState, StateTypes, ViewState } from './types';
import './style.scss';

enum TabTypes {
  STARRED,
  SYSTEM,
  USER,
  ALL,
}

const labelMap = ['Starred', 'System lists', 'My lists', 'All'];

const headersWithoutType = [
  { key: 'display', header: 'List Name' },
  { key: 'memberCount', header: 'No. Patients' },
  { key: 'isStarred', header: '' },
];

function createLabels() {
  const res = [];

  for (let index = 0; index < Object.keys(TabTypes).length / 2; index++) {
    res.push(<Tab label={labelMap[index]} key={index} id={'tab-' + index} />);
  }

  return res;
}

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
    // updatePatientListDetails(listUuid, { isStarred: star }).then(() => setChanged((c) => !c));
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
            if (e.key === 'Enter') {
              setViewState(({ searchTerm }: SearchState) => ({
                type: StateTypes.SEARCH_WITH_RESULTS,
                searchTerm,
                results: ['todo'],
                enter: {},
              }));
            }
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
          tabContentClassName="deactivate-tabs-content"
          onSelectionChange={setTabState}>
          {createLabels()}
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
      <SearchOverlay
        viewState={viewState}
        openPatientList={(listUuid) => {
          setRouteState({ type: RouteStateTypes.SINGLE_LIST, listUuid });
        }}
        setListStarred={setListStarred}
      />
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
