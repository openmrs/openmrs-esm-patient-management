import React, { useEffect, useState, useMemo, useCallback } from 'react';
import dayjs from 'dayjs';
import { first } from 'rxjs/operators';
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
  Stack,
  Switch,
  TimePicker,
  TimePickerSelect,
  FormGroup,
  RadioButton,
  RadioButtonGroup,
} from '@carbon/react';
import { ArrowLeft } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import {
  useLocations,
  useSession,
  ExtensionSlot,
  useLayoutType,
  useVisitTypes,
  saveVisit,
  toOmrsIsoString,
  toDateObjectStrict,
  showSnackbar,
  useConfig,
  ResponsiveWrapper,
  type ConfigObject,
} from '@openmrs/esm-framework';
import BaseVisitType from './base-visit-type.component';
import { addQueueEntry, useVisitQueueEntries } from '../../active-visits/active-visits-table.resource';
import { convertTime12to24, type amPm } from '../../helpers/time-helpers';
import { MemoizedRecommendedVisitType } from './recommended-visit-type.component';
import { useActivePatientEnrollment } from '../hooks/useActivePatientEnrollment';
import { SearchTypes, type PatientProgram, type NewVisitPayload } from '../../types';
import styles from './visit-form.scss';
import { useDefaultLoginLocation } from '../hooks/useDefaultLocation';
import isEmpty from 'lodash-es/isEmpty';

interface VisitFormProps {
  toggleSearchType: (searchMode: SearchTypes, patientUuid) => void;
  patientUuid: string;
  closePanel: () => void;
  mode: boolean;
}

const StartVisitForm: React.FC<VisitFormProps> = ({ patientUuid, toggleSearchType, closePanel, mode }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations();
  const sessionUser = useSession();
  const { defaultFacility, isLoading: loadingDefaultFacility } = useDefaultLoginLocation();

  const config = useConfig() as ConfigObject;
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(config.showRecommendedVisitTypeTab ? 0 : 1);
  const [isMissingVisitType, setIsMissingVisitType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const allVisitTypes = useVisitTypes();
  const [ignoreChanges, setIgnoreChanges] = useState(true);
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const [enrollment, setEnrollment] = useState<PatientProgram>(activePatientEnrollment[0]);
  const { mutate } = useVisitQueueEntries('', '');
  const visitQueueNumberAttributeUuid = config.visitQueueNumberAttributeUuid;
  const [selectedLocation, setSelectedLocation] = useState('');
  const [visitType, setVisitType] = useState('');

  useEffect(() => {
    if (locations?.length && sessionUser) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
      setVisitType(allVisitTypes?.length > 0 ? allVisitTypes[0].uuid : null);
    } else if (!loadingDefaultFacility && defaultFacility) {
      setSelectedLocation(defaultFacility?.uuid);
      setVisitType(allVisitTypes?.length > 0 ? allVisitTypes[0].uuid : null);
    }
  }, [locations, sessionUser, loadingDefaultFacility]);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      // retrieve values from queue extension
      const queueLocation = event?.target['queueLocation']?.value;
      const serviceUuid = event?.target['service']?.value;
      const priority = event?.target['priority']?.value;
      const status = event?.target['status']?.value;
      const sortWeight = event?.target['sortWeight']?.value;

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
        attributes: [],
      };

      const abortController = new AbortController();

      saveVisit(payload, abortController)
        .pipe(first())
        .subscribe(
          (response) => {
            if (response.status === 201) {
              // add new queue entry if visit created successfully
              addQueueEntry(
                response.data.uuid,
                serviceUuid,
                patientUuid,
                priority,
                status,
                sortWeight,
                queueLocation,
                visitQueueNumberAttributeUuid,
              ).then(
                ({ status }) => {
                  if (status === 201) {
                    showSnackbar({
                      kind: 'success',
                      isLowContrast: true,
                      title: t('startAVisit', 'Start a visit'),
                      subtitle: t(
                        'startVisitQueueSuccessfully',
                        'Patient has been added to active visits list and queue.',
                        `${hours} : ${minutes}`,
                      ),
                    });
                    closePanel();
                    mutate();
                  }
                },
                (error) => {
                  showSnackbar({
                    title: t('queueEntryError', 'Error adding patient to the queue'),
                    kind: 'error',
                    subtitle: error?.message,
                  });
                },
              );
            }
          },
          (error) => {
            showSnackbar({
              title: t('startVisitError', 'Error starting visit'),
              kind: 'error',
              subtitle: error?.message,
            });
          },
        );
    },
    [
      closePanel,
      mutate,
      patientUuid,
      selectedLocation,
      t,
      timeFormat,
      visitDate,
      visitQueueNumberAttributeUuid,
      visitTime,
      visitType,
    ],
  );

  const handleOnChange = () => {
    setIgnoreChanges((prevState) => !prevState);
  };

  return (
    <Form className={styles.form} onChange={handleOnChange} onSubmit={handleSubmit}>
      <div>
        {isTablet && (
          <Row className={styles.headerGridRow}>
            <ExtensionSlot name="visit-form-header-slot" className={styles.dataGridRow} state={state} />
          </Row>
        )}
        <div className={styles.backButton}>
          {mode === true ? null : (
            <Button
              kind="ghost"
              renderIcon={(props) => <ArrowLeft size={24} {...props} />}
              iconDescription={t('backToScheduledVisits', 'Back to scheduled visits')}
              size="sm"
              onClick={() => toggleSearchType(SearchTypes.SCHEDULED_VISITS, patientUuid)}>
              <span>{t('backToScheduledVisits', 'Back to scheduled visits')}</span>
            </Button>
          )}
        </div>
        <Stack gap={8} className={styles.container}>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('dateAndTimeOfVisit', 'Date and time of visit')}</div>
            <div className={styles.dateTimeSection}>
              <DatePicker
                dateFormat="d/m/Y"
                datePickerType="single"
                id="visitDate"
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
              <ResponsiveWrapper>
                <TimePicker
                  id="visitStartTime"
                  labelText={t('time', 'Time')}
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
              </ResponsiveWrapper>
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('facility', 'Facility')}</div>
            <Select
              labelText={t('selectFacility', 'Select a facility')}
              id="location"
              invalidText="Required"
              value={selectedLocation}
              defaultSelected={selectedLocation}
              onChange={(event) => setSelectedLocation(event.target.value)}>
              {!selectedLocation ? <SelectItem text={t('selectOption', 'Select an option')} value="" /> : null}
              {!isEmpty(defaultFacility) ? (
                <SelectItem key={defaultFacility?.uuid} text={defaultFacility?.display} value={defaultFacility?.uuid}>
                  {defaultFacility?.display}
                </SelectItem>
              ) : locations?.length > 0 ? (
                locations.map((location) => (
                  <SelectItem key={location.uuid} text={location.display} value={location.uuid}>
                    {location.display}
                  </SelectItem>
                ))
              ) : null}
            </Select>
          </section>

          {config.showRecommendedVisitTypeTab && (
            <section>
              <div className={styles.sectionTitle}>{t('program', 'Program')}</div>
              <FormGroup legendText={t('selectProgramType', 'Select program type')}>
                <RadioButtonGroup
                  defaultSelected={enrollment?.program?.uuid}
                  orientation="vertical"
                  onChange={(uuid) =>
                    setEnrollment(activePatientEnrollment.find(({ program }) => program.uuid === uuid))
                  }
                  name="program-type-radio-group"
                  valueSelected="default-selected">
                  {activePatientEnrollment.map(({ uuid, display, program }) => (
                    <RadioButton
                      key={uuid}
                      className={styles.radioButton}
                      id={uuid}
                      labelText={display}
                      value={program.uuid}
                    />
                  ))}
                </RadioButtonGroup>
              </FormGroup>
            </section>
          )}
          <section>
            <div className={styles.sectionTitle}>{t('visitType', 'Visit Type')}</div>
            <ContentSwitcher
              selectedIndex={contentSwitcherIndex}
              className={styles.contentSwitcher}
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

          <ExtensionSlot name="add-queue-entry-slot" />
          <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
            <Button className={styles.button} kind="secondary" onClick={closePanel}>
              {t('discard', 'Discard')}
            </Button>
            <Button className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
              {t('startVisit', 'Start visit')}
            </Button>
          </ButtonSet>
        </Stack>
      </div>
    </Form>
  );
};

export default StartVisitForm;
