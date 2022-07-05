import { useLayoutType } from '@openmrs/esm-framework';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import PatientSearchComponent from './patient-search-lg.component';
import styles from './patient-search-page.scss';

interface RouteParams {
  query: string;
}

interface PatientSearchPageComponentProps extends RouteComponentProps<RouteParams> {}

const PatientSearchPageComponent: React.FC<PatientSearchPageComponentProps> = ({ match }) => {
  const { query } = match.params;
  const isDesktop = useLayoutType() === 'desktop';

  return isDesktop ? (
    <div className={styles.patientSearchPage}>
      <div className={styles.patientSearchComponent}>
        <PatientSearchComponent query={query} resultsToShow={isDesktop ? 5 : 15} stickyPagination />
      </div>
    </div>
  ) : (
    <></>
  );
};

export default PatientSearchPageComponent;
