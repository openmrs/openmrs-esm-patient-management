import React, { CSSProperties, useMemo } from 'react';
import {
  DataTable,
  DataTableCustomRenderProps,
  DataTableHeader,
  DataTableSkeleton,
  Table,
  TableBody,
  TableContainer,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Search,
  SearchProps,
  InlineLoading,
} from 'carbon-components-react';
import Star16 from '@carbon/icons-react/es/star/16';
import StarFilled16 from '@carbon/icons-react/es/star--filled/16';
import { useSession, ConfigurableLink, useLayoutType } from '@openmrs/esm-framework';
import styles from './patient-list-list.scss';
import debounce from 'lodash-es/debounce';
import { updateLocalOrRemotePatientList } from '../api/api';
import { PatientList } from '../api/types';

const defaultHeaders: Array<DataTableHeader<keyof PatientList>> = [
  { key: 'display', header: 'List Name' },
  { key: 'type', header: 'List Type' },
  { key: 'size', header: 'No. Patients' },
  { key: 'isStarred', header: '' },
];

interface PatientListTableProps {
  style?: CSSProperties;
  patientLists: Array<PatientList>;
  loading?: boolean;
  fetching?: boolean;
  headers?: Array<DataTableHeader<keyof PatientList>>;
  refetch(): void;
  search: {
    onSearch(searchTerm: string): any;
    placeHolder: string;
    currentSearchTerm?: string;
    otherSearchProps?: SearchProps;
  };
}

const PatientListTable: React.FC<PatientListTableProps> = ({
  style,
  patientLists = [],
  loading = false,
  fetching = false,
  headers = defaultHeaders,
  refetch,
  search,
}) => {
  const userId = useSession()?.user.uuid;
  const isDesktop = useLayoutType() === 'desktop';

  const handleSearch = useMemo(() => debounce((searchTerm) => search.onSearch(searchTerm), 300), []);
  const handleToggleStarred = async (patientListId: string, isStarred: boolean) => {
    if (userId) {
      await updateLocalOrRemotePatientList(userId, patientListId, { isStarred });
      refetch();
    }
  };

  return !loading ? (
    <div>
      <div id="table-tool-bar" className={styles.searchContainer}>
        <div>{fetching && <InlineLoading />}</div>
        <div>
          <Search
            id="patient-list-search"
            placeholder={search.placeHolder}
            labelText=""
            size={isDesktop ? 'sm' : 'xl'}
            className={styles.search}
            light
            onChange={(evnt) => handleSearch(evnt.target.value)}
            defaultValue={search.currentSearchTerm}
            {...search?.otherSearchProps}
          />
        </div>
      </div>
      <DataTable rows={patientLists} headers={headers}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getTableContainerProps,
        }: DataTableCustomRenderProps) => (
          <TableContainer style={{ ...style, backgroundColor: 'transparent' }} {...getTableContainerProps()}>
            <Table {...getTableProps()} isSortable useZebraStyles>
              <colgroup>
                <col span={1} style={{ width: '60%' }} />
                <col span={1} style={{ width: '20%' }} />
                <col span={1} style={{ width: '20%' }} />
              </colgroup>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader
                      className={isDesktop ? styles.desktopHeader : styles.tabletHeader}
                      key={header.key}
                      {...getHeaderProps({ header })}
                      isSortable>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody className={styles.tableBody}>
                {rows.map((row, index) => (
                  <TableRow
                    className={isDesktop ? styles.desktopRow : styles.tabletRow}
                    key={row.id}
                    {...getRowProps({ row })}>
                    {row.cells.map((cell) => {
                      switch (cell.info.header) {
                        case 'display':
                          return (
                            <TableCell className={styles.tableCell} key={cell.id}>
                              <ConfigurableLink
                                className={styles.link}
                                to={`\${openmrsSpaBase}/patient-list/${patientLists[index]?.id}`}>
                                {cell.value}
                              </ConfigurableLink>
                            </TableCell>
                          );

                        case 'isStarred':
                          return (
                            <TableCell
                              key={cell.id}
                              style={{ cursor: 'pointer' }}
                              onClick={() => handleToggleStarred(row.id, !cell.value)}>
                              {cell.value ? (
                                <StarFilled16 className={styles.interactiveText01} />
                              ) : (
                                <Star16 className={styles.interactiveText01} />
                              )}
                            </TableCell>
                          );

                        case 'type':
                          return <TableCell key={cell.id}>{cell.value}</TableCell>;

                        default:
                          return <TableCell key={cell.id}>{cell.value}</TableCell>;
                      }
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  ) : (
    <DataTableSkeleton
      style={{ ...style, backgroundColor: 'transparent', padding: '0rem' }}
      showToolbar={false}
      showHeader={false}
      rowCount={4}
      columnCount={4}
      zebra
    />
  );
};

export default PatientListTable;
