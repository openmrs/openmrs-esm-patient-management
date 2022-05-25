import React, { useEffect, useState, useMemo, useCallback } from 'react';
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
  useSession,
  ExtensionSlot,
  useLayoutType,
  useConfig,
  useVisitTypes,
  useVisit,
  navigate,
  NewVisitPayload,
  saveVisit,
  toOmrsIsoString,
  toDateObjectStrict,
  showNotification,
  showToast,
} from '@openmrs/esm-framework';
import styles from './visit-form.scss';
import ArrowLeft24 from '@carbon/icons-react/es/arrow--left/24';
import { SearchTypes } from '../../types/index';
import BaseVisitType from './base-visit-type.component';
import { first } from 'rxjs/operators';
import { convertTime12to24, amPm } from '../../helpers/time-helpers';

interface VisitFormProps {
  toggleSearchType: (searchMode: SearchTypes, patientUuid) => void;
  patientUuid: string;
}

const StartVisitForm: React.FC<VisitFormProps> = ({ patientUuid, toggleSearchType }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations();
  const sessionUser = useSession();
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(0);
  const [isMissingVisitType, setIsMissingVisitType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('');
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const [visitType, setVisitType] = useState<string | null>(null);
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const allVisitTypes = useVisitTypes();
  const [ignoreChanges, setIgnoreChanges] = useState(true);

  useEffect(() => {
    if (locations && sessionUser?.sessionLocation?.uuid) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
    }
  }, [locations, sessionUser]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      if (!visitType) {
        setIsMissingVisitType(true);
        return;
      }

      setIsSubmitting(true);

      const [hours, minutes] = convertTime12to24(visitTime, timeFormat);

      const payload: NewVisitPayload = {
        patient: patientUuid,
        startDatetime: toDateObjectStrict(
          toOmrsIsoString(
            new Date(dayjs(visitDate).year(), dayjs(visitDate).month(), dayjs(visitDate).date(), hours, minutes),
          ),
        ),
        visitType: visitType,
        location: selectedLocation,
      };

      const abortController = new AbortController();
      saveVisit(payload, abortController)
        .pipe(first())
        .subscribe(
          (response) => {
            if (response.status === 201) {
              showToast({
                kind: 'success',
                description: t(
                  'startVisitSuccessfully',
                  'Visit started successfully. Patient has been added to active visits list.',
                  `${hours} : ${minutes}`,
                ),
              });
              navigate({ to: `\${openmrsSpaBase}/home` });
            }
          },
          (error) => {
            showNotification({
              title: t('startVisitError', 'Error starting visit'),
              kind: 'error',
              critical: true,
              description: error?.message,
            });
          },
        );
    },
    [patientUuid, selectedLocation, t, timeFormat, visitDate, visitTime, visitType],
  );

  const handleOnChange = () => {
    setIgnoreChanges((prevState) => !prevState);
  };

  return (
    <Form className={styles.form} onChange={handleOnChange}>
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
              iconDescription={t('backToScheduledVisits', 'Back to scheduled visits')}
              size="sm"
              onClick={() => toggleSearchType(SearchTypes.SCHEDULED_VISITS, patientUuid)}>
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
                onChange={(event) => setVisitTime(event.target.value as amPm)}
                pattern="^(1[0-2]|0?[1-9]):([0-5]?[0-9])$"
                style={{ marginLeft: '0.125rem', flex: 'none' }}
                value={visitTime}>
                <TimePickerSelect
                  id="visitStartTimeSelect"
                  onChange={(event) => setTimeFormat(event.target.value as amPm)}
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
            {contentSwitcherIndex === 0 && <></>}
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
            <section>
              <InlineNotification
                style={{ margin: '0', minWidth: '100%' }}
                kind="error"
                lowContrast={true}
                title={t('missingVisitType', 'Missing visit type')}
                subtitle={t('selectVisitType', 'Please select a Visit Type')}
              />
            </section>
          )}
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
        <Button
          className={styles.button}
          kind="secondary"
          onClick={() => toggleSearchType(SearchTypes.BASIC, patientUuid)}>
          {t('discard', 'Discard')}
        </Button>
        <Button onClick={handleSubmit} className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {t('startVisit', 'Start visit')}
        </Button>
      </ButtonSet>
    </Form>
  );
};

export default StartVisitForm;
