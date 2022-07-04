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
  return (
    <div className={styles.patientSearchPage}>
      <PatientSearchComponent query={query} />
    </div>
  );
};

export default PatientSearchPageComponent;
