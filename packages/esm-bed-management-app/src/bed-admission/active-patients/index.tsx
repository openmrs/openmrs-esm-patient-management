import React from 'react';
import Header from '../../header/header.component';
import styles from './styles.scss';
import BedAdmissionTabs from '../bed-admission-tabs.component';

const ActivePatientsHome: React.FC = () => {
  return (
    <section className={styles.section}>
      <Header route="In Patient" headerTitle="" />
      <BedAdmissionTabs />
    </section>
  );
};

export default ActivePatientsHome;
