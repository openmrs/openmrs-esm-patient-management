import React, { useState } from 'react';
import PatientQueueHeader from './patient-queue-header/patient-queue-header.component';
import ClinicMetrics from './patient-queue-metrics/clinic-metrics.component';
import styles from './root.scss';
import PatientSearchLaunch from './patient-search-icon/patient-search-icon.component';
import Add16 from '@carbon/icons-react/es/add/16';
import { Tile, Button, Switch, ContentSwitcher, Grid, Row, Column } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';

interface HomeProps {}

enum RouteStateTypes {
  ADD_PATIENT_LIST,
  ADVANCED_PATIENT_LIST,
}
//equivalent to attributes
interface AddPatientRouteState {
  type: RouteStateTypes.ADD_PATIENT_LIST;
}

interface AdvancedPatientListState {
  type: RouteStateTypes.ADVANCED_PATIENT_LIST;
}

type RouteState = AddPatientRouteState | AdvancedPatientListState;

const Home: React.FC<HomeProps> = () => {
  const [routeState, setRouteState] = useState<RouteState>({ type: RouteStateTypes.ADD_PATIENT_LIST });
  const { t } = useTranslation();

  return (
    <main className={`omrs-main-content ${styles.patientQueueBg}`}>
      <section className={styles.patientQueuePageHeader}>
        <PatientQueueHeader />
        <ClinicMetrics />

        <div className={styles.patientQueueAddToList}>
          <Grid fullWidth>
            <Row>
              <Column sm={12} md={4} lg={4}>
                <Tile>
                  <h2> Active Visits</h2>
                </Tile>
              </Column>

              <Column sm={12} md={4} lg={4}>
                <Tile>
                  <ContentSwitcher>
                    <Switch name={'first'} text="Default" />
                    <Switch name={'second'} text="Large" />
                  </ContentSwitcher>
                </Tile>
              </Column>

              <Column sm={12} md={4} lg={4}>
                <Tile>
                  <Button
                    kind="secondary"
                    renderIcon={Add16}
                    iconDescription="Add Patient To List"
                    onClick={() => setRouteState({ type: RouteStateTypes.ADVANCED_PATIENT_LIST })}>
                    {t('add', 'Add Patient To List')}
                  </Button>
                </Tile>
              </Column>
            </Row>
          </Grid>
        </div>
      </section>

      <section>
        {routeState.type === RouteStateTypes.ADVANCED_PATIENT_LIST && (
          <PatientSearchLaunch close={() => setRouteState({ type: RouteStateTypes.ADD_PATIENT_LIST })} />
        )}
      </section>
    </main>
  );
};

export default Home;
