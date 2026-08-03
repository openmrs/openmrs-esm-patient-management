import React, { useId, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  DataTableSkeleton,
  InlineLoading,
  Layer,
  Pagination,
  Search,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Tile,
} from '@carbon/react';
import {
  age,
  ConfigurableLink,
  EmptyCardIllustration,
  isDesktop,
  useDebounce,
  useLayoutType,
} from '@openmrs/esm-framework';
import { useAllPatients } from '../api/hooks';
import styles from './all-patients-table.scss';

const AllPatientsTable: React.FC = () => {
  const { t } = useTranslation();
  const id = useId();
  const layout = useLayoutType();
  const responsiveSize = isDesktop(layout) ? 'sm' : 'lg';

  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm);

  const { patients, totalPatients, isLoading, isValidating } = useAllPatients(
    (currentPage - 1) * currentPageSize,
    currentPageSize,
    debouncedSearchTerm,
  );

  const headers = useMemo(
    () => [
      { key: 'name', header: t('name', 'Name') },
      { key: 'identifier', header: t('identifier', 'Identifier') },
      { key: 'sex', header: t('sex', 'Sex') },
      { key: 'age', header: t('age', 'Age') },
    ],
    [t],
  );

  const tableRows = useMemo(
    () =>
      patients.map((patient) => ({
        id: patient.uuid,
        name: (
          <ConfigurableLink className={styles.link} to={`${window.getOpenmrsSpaBase()}patient/${patient.uuid}/chart/`}>
            {patient.name}
          </ConfigurableLink>
        ),
        identifier: patient.identifier,
        sex: patient.sex,
        age: patient.birthDate !== '--' ? age(patient.birthDate) : '--',
      })),
    [patients],
  );

  if (isLoading) {
    return (
      <div className={styles.skeletonContainer}>
        <DataTableSkeleton
          data-testid="data-table-skeleton"
          className={styles.dataTableSkeleton}
          rowCount={5}
          columnCount={4}
          zebra
        />
      </div>
    );
  }

  return (
    <div className={styles.tableOverride}>
      <div className={styles.searchContainer}>
        {isValidating && <InlineLoading />}
        <Layer>
          <Search
            id={`${id}-search`}
            className={styles.searchOverrides}
            labelText=""
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t('searchAllPatients', 'Search all patients')}
            size={responsiveSize}
          />
        </Layer>
      </div>
      {tableRows.length > 0 ? (
        <>
          <DataTable rows={tableRows} headers={headers} size={responsiveSize} useZebraStyles>
            {({ rows, headers, getHeaderProps, getTableProps, getRowProps }) => (
              <TableContainer>
                <Table className={styles.table} {...getTableProps()} data-testid="allPatientsTable">
                  <TableHead>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHeader
                          {...getHeaderProps({ header })}
                          className={isDesktop(layout) ? styles.desktopHeader : styles.tabletHeader}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow
                        {...getRowProps({ row })}
                        className={isDesktop(layout) ? styles.desktopRow : styles.tabletRow}
                        key={row.id}>
                        {row.cells.map((cell) => (
                          <TableCell key={cell.id}>{cell.value?.content ?? cell.value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
          <Pagination
            backwardText={t('previousPage', 'Previous page')}
            className={styles.paginationOverride}
            forwardText={t('nextPage', 'Next page')}
            onChange={({ page, pageSize }) => {
              setCurrentPage(page);
              setCurrentPageSize(pageSize);
            }}
            page={currentPage}
            pageSize={currentPageSize}
            pageSizes={[10, 20, 30, 40, 50]}
            totalItems={totalPatients}
          />
        </>
      ) : (
        <Layer>
          <Tile className={styles.tile}>
            <div className={styles.illo}>
              <EmptyCardIllustration />
            </div>
            <p className={styles.content}>{t('noPatientsToDisplay', 'There are no patients to display')}</p>
          </Tile>
        </Layer>
      )}
    </div>
  );
};

export default AllPatientsTable;
