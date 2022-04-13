import React, { useEffect, useState, useMemo } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  ContentSwitcher,
  DatePicker,
  DatePickerInput,
  Form,
  InlineNotification,
  Row,
  Select,
  SelectItem,
  Switch,
  TimePicker,
  TimePickerSelect,
} from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import {
  useLocations,
  useSessionUser,
  ExtensionSlot,
  useLayoutType,
  useConfig,
  useVisitTypes,
  useVisit,
} from '@openmrs/esm-framework';
import BaseVisitType from './base-visit-type.component';
import { MemoizedRecommendedVisitType } from './recommended-visit-type.component';
import styles from './visit-form.scss';
import { SearchTypes, PatientProgram } from '../../types';
import { useActivePatientEnrollment } from '../programs/usePatientProgramEnrollment';
import ArrowLeft24 from '@carbon/icons-react/es/arrow--left/24';
import { OutpatientConfig } from '../../config-schema';

interface VisitFormProps {
  toggleSearchType: (searchMode: SearchTypes) => void;
  patientUuid: string;
}

const StartVisitForm: React.FC<VisitFormProps> = ({ patientUuid, toggleSearchType }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations();
  const sessionUser = useSessionUser();
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(0);
  const [isMissingVisitType, setIsMissingVisitType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [timeFormat, setTimeFormat] = useState(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const [visitType, setVisitType] = useState<string | null>(null);
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const allVisitTypes = useVisitTypes();
  const config = useConfig() as OutpatientConfig;
  // const { mutate } = useVisit(patientUuid);
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const [enrollment, setEnrollment] = useState<PatientProgram>(activePatientEnrollment[0]);

  // const { mutate } = useVisit(patientUuid);

  useEffect(() => {
    if (locations && sessionUser?.sessionLocation?.uuid) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
    }
  }, [locations, sessionUser]);

  return (
    <Form className={styles.form}>
      <div>
        {isTablet && (
          <Row className={styles.headerGridRow}>
            <ExtensionSlot extensionSlotName="visit-form-header-slot" className={styles.dataGridRow} state={state} />
          </Row>
        )}
        <div className={styles.container}>
          <div className={styles.backButton}>
            <Button
              kind="ghost"
              renderIcon={ArrowLeft24}
              iconDescription="Back to scheduled visits"
              size="sm"
              onClick={() => toggleSearchType(SearchTypes.BASIC)}>
              <span>{t('backToScheduledVisits', 'Back to scheduled visits')}</span>
            </Button>
          </div>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('dateAndTimeOfVisit', 'Date and time of visit')}</div>
            <div className={styles.dateTimeSection}>
              <DatePicker
                dateFormat="d/m/Y"
                datePickerType="single"
                id="visitDate"
                light={isTablet}
                style={{ paddingBottom: '1rem' }}
                maxDate={new Date().toISOString()}
                onChange={([date]) => setVisitDate(date)}
                value={visitDate}>
                <DatePickerInput
                  id="visitStartDateInput"
                  labelText={t('date', 'Date')}
                  placeholder="dd/mm/yyyy"
                  style={{ width: '100%' }}
                />
              </DatePicker>
              <TimePicker
                id="visitStartTime"
                labelText={t('time', 'Time')}
                light={isTablet}
                onChange={(event) => setVisitTime(event.target.value)}
                pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                style={{ marginLeft: '0.125rem', flex: 'none' }}
                value={visitTime}>
                <TimePickerSelect
                  id="visitStartTimeSelect"
                  onChange={(event) => setTimeFormat(event.target.value)}
                  value={timeFormat}
                  labelText={t('time', 'Time')}
                  aria-label={t('time', 'Time')}>
                  <SelectItem value="AM" text="AM" />
                  <SelectItem value="PM" text="PM" />
                </TimePickerSelect>
              </TimePicker>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('visitLocation', 'Visit Location')}</div>
            <Select
              labelText={t('selectLocation', 'Select a location')}
              id="location"
              invalidText="Required"
              value={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}
              light={isTablet}>
              {locations?.length > 0 &&
                locations.map((location) => (
                  <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                    {location.display}
                  </SelectItem>
                ))}
            </Select>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('visitType', 'Visit Type')}</div>
            <ContentSwitcher
              selectedIndex={contentSwitcherIndex}
              className={styles.contentSwitcher}
              size="lg"
              onChange={({ index }) => setContentSwitcherIndex(index)}>
              <Switch name="recommended" text={t('recommended', 'Recommended')} />
              <Switch name="all" text={t('all', 'All')} />
            </ContentSwitcher>
            {contentSwitcherIndex === 0 && !isLoading && (
              <MemoizedRecommendedVisitType
                onChange={(visitType) => {
                  setVisitType(visitType);
                  setIsMissingVisitType(false);
                }}
                patientUuid={patientUuid}
                patientProgramEnrollment={enrollment}
                locationUuid={selectedLocation}
              />
            )}
            {contentSwitcherIndex === 1 && (
              <BaseVisitType
                onChange={(visitType) => {
                  setVisitType(visitType);
                  setIsMissingVisitType(false);
                }}
                visitTypes={allVisitTypes}
                patientUuid={patientUuid}
              />
            )}
          </section>
          {isMissingVisitType && (
            <section className={styles.section}>
              <InlineNotification
                style={{ margin: '0', minWidth: '100%' }}
                kind="error"
                lowContrast={true}
                title={t('missingVisitType', 'Missing visit type')}
                subtitle={t('selectVisitType', 'Please select a Visit Type')}
              />
            </section>
          )}
        </div>
      </div>
      <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
        <Button className={styles.button} kind="secondary" onClick={() => toggleSearchType(SearchTypes.BASIC)}>
          {t('discard', 'Discard')}
        </Button>
        <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {t('startVisit', 'Start visit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default StartVisitForm;
