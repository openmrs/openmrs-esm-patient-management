import React from 'react';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';
import { Button, Tile } from '@carbon/react';
import { ArrowRight, CircleFilled } from '@carbon/react/icons';
import { navigate, useConfig } from '@openmrs/esm-framework';
import { calculateBMI, assessValue, getReferenceRangesForConcept } from '../current-visit.resource';
import { useVitalsConceptMetadata } from '../hooks/useVitalsConceptMetadata';
import { ConfigObject } from '../../config-schema';
import { PatientVitals } from '../../types/index';
import styles from './triage-note.scss';

interface VitalsComponentProps {
  vitals: Array<PatientVitals>;
  patientUuid: string;
  visitType: string;
}

const Vitals: React.FC<VitalsComponentProps> = ({ vitals, patientUuid, visitType }) => {
  const { t } = useTranslation();
  const config = useConfig() as ConfigObject;
  const { data: conceptUnits, conceptMetadata } = useVitalsConceptMetadata();

  const vitalsToDisplay = vitals.reduce(
    (previousVital, currentVital) => Object.assign(previousVital, currentVital),
    {},
  );

  return (
    <div>
      {Object.keys(vitalsToDisplay).length > 0 ? (
        <div>
          <div className={styles.row}>
            <Tile className={styles.tile}>
              <p>{t('temperature', 'Temperature')}</p>
              <div className={styles.vitalValuesWrapper}>
                <p className={styles.vitalValues}>{vitalsToDisplay.temperature ? vitalsToDisplay.temperature : '--'}</p>
                <p className={styles.unit}>{conceptUnits.get(config.concepts.temperatureUuid) ?? ''}</p>
                <p>{}</p>
              </div>
            </Tile>
            <Tile className={styles.tile}>
              <p>{t('bp', 'Bp')}</p>
              <div className={styles.vitalValuesWrapper}>
                <p className={styles.vitalValues}>
                  {vitalsToDisplay.systolic ? vitalsToDisplay.systolic : '--'} /
                  {vitalsToDisplay.systolic ? vitalsToDisplay.diastolic : '--'}
                </p>
                <p className={styles.unit}>{conceptUnits.get(config.concepts.systolicBloodPressureUuid) ?? ''}</p>
              </div>
            </Tile>
            <Tile className={styles.tile}>
              <p>
                {t('heartRate', 'Heart rate')}
                {assessValue(
                  vitalsToDisplay.pulse,
                  getReferenceRangesForConcept(config.concepts.pulseUuid, conceptMetadata),
                ) !== 'normal' ? (
                  <CircleFilled className={styles['danger-icon']} size={16} />
                ) : null}
              </p>
              <div className={styles.vitalValuesWrapper}>
                <p className={styles.vitalValues}>{vitalsToDisplay.pulse ? vitalsToDisplay.pulse : '--'}</p>
                <p className={styles.unit}>{conceptUnits.get(config.concepts.pulseUuid) ?? ''}</p>
                <p className={styles.iconWrapper}>
                  {assessValue(
                    vitalsToDisplay.pulse,
                    getReferenceRangesForConcept(config.concepts.pulseUuid, conceptMetadata),
                  ) === 'high' ? (
                    <span className={styles.high}></span>
                  ) : assessValue(
                      vitalsToDisplay.pulse,
                      getReferenceRangesForConcept(config.concepts.pulseUuid, conceptMetadata),
                    ) === 'critically_high' ? (
                    <span className={styles['critically-high']}></span>
                  ) : assessValue(
                      vitalsToDisplay.pulse,
                      getReferenceRangesForConcept(config.concepts.pulseUuid, conceptMetadata),
                    ) === 'low' ? (
                    <span className={styles.low}></span>
                  ) : assessValue(
                      vitalsToDisplay.pulse,
                      getReferenceRangesForConcept(config.concepts.pulseUuid, conceptMetadata),
                    ) === 'critically_low' ? (
                    <span className={styles['critically-low']}></span>
                  ) : null}
                </p>
              </div>
            </Tile>
            <Tile className={styles.tile}>
              <p>{t('sp02', 'Sp02')}</p>
              <div className={styles.vitalValuesWrapper}>
                <p className={styles.vitalValues}>
                  {vitalsToDisplay.oxygenSaturation ? vitalsToDisplay.oxygenSaturation : '--'}
                </p>
                <p className={styles.unit}>{conceptUnits.get(config.concepts.oxygenSaturationUuid) ?? ''}</p>
              </div>
            </Tile>
          </div>
          <div className={styles.row}>
            <Tile className={styles.tile}>
              <p>{t('rRate', 'R. Rate')}</p>
              <div className={styles.vitalValuesWrapper}>
                <p className={styles.vitalValues}>
                  {vitalsToDisplay.respiratoryRate ? vitalsToDisplay.respiratoryRate : '--'}
                </p>
                <p className={styles.unit}>{conceptUnits.get(config.concepts.respiratoryRateUuid) ?? ''}</p>
              </div>
            </Tile>
            <Tile className={styles.tile}>
              <p>{t('height', 'Height')}</p>
              <div className={styles.vitalValuesWrapper}>
                <p className={styles.vitalValues}>{vitalsToDisplay.height ? vitalsToDisplay.height : '--'}</p>
                <p className={styles.unit}>{conceptUnits.get(config.concepts.heightUuid) ?? ''}</p>
              </div>
            </Tile>
            <Tile className={styles.tile}>
              <p>{t('weight', 'Weight')}</p>
              <div className={styles.vitalValuesWrapper}>
                <p className={styles.vitalValues}>{vitalsToDisplay.weight ? vitalsToDisplay.weight : '--'} </p>
                <p className={styles.unit}>{conceptUnits.get(config.concepts.weightUuid) ?? ''}</p>
              </div>
            </Tile>
            <Tile className={styles.tile}>
              <p>{t('bmi', 'Bmi')}</p>
              <div className={styles.vitalValuesWrapper}>
                <p className={styles.vitalValues}>
                  {' '}
                  {calculateBMI(Number(vitalsToDisplay.weight), Number(vitalsToDisplay.height))}
                </p>
                <p className={styles.unit}>{config.biometrics['bmiUnit']}</p>
              </div>
            </Tile>
          </div>
          <p className={styles.subHeading}>
            {vitalsToDisplay.provider?.name ? <span> {vitalsToDisplay.provider.name} </span> : null} ·{' '}
            {vitalsToDisplay.time}
          </p>
        </div>
      ) : (
        <div>
          {visitType === 'currentVisit' ? (
            <div>
              <p className={styles.emptyText}>
                {t('vitalsNotRecordedForVisit', 'Vitals has not been recorded for this patient for this visit')}
              </p>
              <Button
                size="sm"
                kind="ghost"
                renderIcon={(props) => <ArrowRight size={16} {...props} />}
                onClick={() => navigate({ to: `\${openmrsSpaBase}/patient/${patientUuid}/chart` })}
                iconDescription={t('vitalsForm', 'Vitals form')}>
                {t('vitalsForm', 'Vitals form')}
              </Button>
            </div>
          ) : (
            <p className={classNames(styles.bodyLong01, styles.text02)}>{t('noVitalsFound', 'No vitals found')}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Vitals;
