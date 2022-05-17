import React from 'react';
import { Button, Grid, Row, Tag, Tile } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import { PatientVitals, calculateBMI } from '../current-visit.resource';
import ArrowRight16 from '@carbon/icons-react/es/arrow--right/16';
import { navigate } from '@openmrs/esm-framework';
import styles from './triage-note.scss';
import CircleFillGlyph from '@carbon/icons-react/es/circle--solid/16';
interface VitalsComponentProps {
  vitals: Array<PatientVitals>;
  patientUuid: string;
}

const Vitals: React.FC<VitalsComponentProps> = ({ vitals, patientUuid }) => {
  const { t } = useTranslation();

  let formattedVitals = vitals.reduce((r, c) => Object.assign(r, c), {});

  return (
    <div>
      {formattedVitals ? (
        <div>
          <Grid className={styles.grid}>
            <Row>
              <Tile light>
                <p>Temperature</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>
                    {formattedVitals.temperature ? formattedVitals.temperature : '--'}
                  </p>
                  <p className={styles.unit}>°C</p>
                </div>
              </Tile>
              <Tile light>
                <p>Bp</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>{formattedVitals.systolic ? formattedVitals.systolic : '--'}</p>
                  <p className={styles.unit}> mmHg</p>
                </div>
              </Tile>
              <Tile>
                <p>
                  Heart rate <CircleFillGlyph className={styles.notification} />
                </p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>{formattedVitals.pulse ? formattedVitals.pulse : '--'}</p>
                  <p className={styles.unit}>bpm</p>
                </div>
              </Tile>
            </Row>

            <Row>
              <Tile light>
                <p>Sp02</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>
                    {formattedVitals.oxygenSaturation ? formattedVitals.oxygenSaturation : '--'}
                  </p>
                  <p className={styles.unit}>%</p>
                </div>
              </Tile>
              <Tile light>
                <p>R. Rate</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>
                    {formattedVitals.respiratoryRate ? formattedVitals.respiratoryRate : '--'}
                  </p>
                  <p className={styles.unit}>/ min</p>
                </div>
              </Tile>
            </Row>

            <Row>
              <Tile light>
                <p>Height</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>{formattedVitals.height ? formattedVitals.height : '--'}</p>
                  <p className={styles.unit}>cm</p>
                </div>
              </Tile>
              <Tile light>
                <p>Bmi</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>
                    {' '}
                    {calculateBMI(Number(formattedVitals.weight), Number(formattedVitals.height))}
                  </p>
                  <p className={styles.unit}>kg / m²</p>
                </div>
              </Tile>
              <Tile light>
                <p>Weight</p>
                <div className={styles.vitalValuesWrapper}>
                  <p className={styles.vitalValues}>{formattedVitals.weight ? formattedVitals.weight : '--'} </p>
                  <p className={styles.unit}>kg</p>
                </div>
              </Tile>
            </Row>
          </Grid>
          <p className={styles.subHeading}>
            {formattedVitals.provider.name ? <span> {formattedVitals.provider.name} </span> : null} ·{' '}
            {formattedVitals.time}
          </p>
        </div>
      ) : (
        <div>
          <p className={styles.emptyText}>Vitals has not been recorded for this patient for this visit</p>
          <Button
            size="small"
            kind="ghost"
            renderIcon={ArrowRight16}
            onClick={() => navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart` })}
            iconDescription={t('vitalsForm', 'Vitals form')}>
            {t('vitalsForm', 'Vitals form')}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Vitals;
