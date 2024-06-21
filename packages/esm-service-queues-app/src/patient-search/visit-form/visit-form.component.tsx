import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import dayjs from 'dayjs';
import { first } from 'rxjs/operators';
import {
  Button,
  ButtonSet,
  ContentSwitcher,
  DatePicker,
  DatePickerInput,
  Form,
  FormGroup,
  InlineNotification,
  RadioButton,
  RadioButtonGroup,
  Row,
  Select,
  SelectItem,
  Stack,
  Switch,
  TimePicker,
  TimePickerSelect,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import {
  ExtensionSlot,
  ResponsiveWrapper,
  saveVisit,
  showSnackbar,
  toDateObjectStrict,
  toOmrsIsoString,
  useConfig,
  useLayoutType,
  useLocations,
  useSession,
} from '@openmrs/esm-framework';
import { RecommendedVisitTypeSelector, VisitTypeSelector } from './visit-type-selector.component';
import { postQueueEntry } from '../../active-visits/active-visits-table.resource';
import { type amPm, convertTime12to24 } from '../../helpers/time-helpers';
import { useActivePatientEnrollment } from '../hooks/useActivePatientEnrollment';
import { type NewVisitPayload, type PatientProgram } from '../../types';
import styles from './visit-form.scss';
import { useDefaultLoginLocation } from '../hooks/useDefaultLocation';
import isEmpty from 'lodash-es/isEmpty';
import { useMutateQueueEntries } from '../../hooks/useQueueEntries';
import { type ConfigObject } from '../../config-schema';
import { datePickerFormat, datePickerPlaceHolder } from '../../constants';
import VisitFormQueueFields from '../visit-form-queue-fields/visit-form-queue-fields.component';

interface VisitFormProps {
  patientUuid: string;
  closeWorkspace: () => void;
}

const VisitForm: React.FC<VisitFormProps> = ({ patientUuid, closeWorkspace }) => {
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations();
  const sessionUser = useSession();
  const { defaultFacility, isLoading: loadingDefaultFacility } = useDefaultLoginLocation();

  const config = useConfig<ConfigObject>();
  const [contentSwitcherIndex, setContentSwitcherIndex] = useState(config.showRecommendedVisitTypeTab ? 0 : 1);
  const [isMissingVisitType, setIsMissingVisitType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState(dayjs(new Date()).format('hh:mm'));
  const state = useMemo(() => ({ patientUuid }), [patientUuid]);
  const [ignoreChanges, setIgnoreChanges] = useState(true);
  const { activePatientEnrollment, isLoading } = useActivePatientEnrollment(patientUuid);
  const [enrollment, setEnrollment] = useState<PatientProgram>(activePatientEnrollment[0]);
  const { mutateQueueEntries } = useMutateQueueEntries();
  const visitQueueNumberAttributeUuid = config.visitQueueNumberAttributeUuid;
  const [selectedLocation, setSelectedLocation] = useState('');
  const [visitType, setVisitType] = useState('');
  const [{ service, priority, status, sortWeight, queueLocation }, setVisitFormFields] = useState({
    service: null,
    priority: null,
    status: null,
    sortWeight: null,
    queueLocation: null,
  });

  useEffect(() => {
    if (locations?.length && sessionUser) {
      setSelectedLocation(sessionUser?.sessionLocation?.uuid);
    } else if (!loadingDefaultFacility && defaultFacility) {
      setSelectedLocation(defaultFacility?.uuid);
    }
  }, [locations, sessionUser, loadingDefaultFacility]);

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
        attributes: [],
      };

      const abortController = new AbortController();

      saveVisit(payload, abortController)
        .pipe(first())
        .subscribe(
          (response) => {
            if (response.status === 201) {
              // add new queue entry if visit created successfully
              postQueueEntry(
                response.data.uuid,
                service,
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
                    closeWorkspace();
                    mutateQueueEntries();
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
      closeWorkspace,
      mutateQueueEntries,
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
        <Stack gap={8} className={styles.container}>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>{t('dateAndTimeOfVisit', 'Date and time of visit')}</div>
            <div className={styles.dateTimeSection}>
              <DatePicker
                dateFormat={datePickerFormat}
                datePickerType="single"
                id="visitDate"
                style={{ paddingBottom: '1rem' }}
                maxDate={new Date().toISOString()}
                onChange={([date]) => setVisitDate(date)}
                value={visitDate}>
                <DatePickerInput
                  id="visitStartDateInput"
                  labelText={t('date', 'Date')}
                  placeholder={datePickerPlaceHolder}
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
            {config.showRecommendedVisitTypeTab && (
              <ContentSwitcher
                selectedIndex={contentSwitcherIndex}
                className={styles.contentSwitcher}
                onChange={({ index }) => setContentSwitcherIndex(index)}>
                <Switch name="recommended" text={t('recommended', 'Recommended')} />
                <Switch name="all" text={t('all', 'All')} />
              </ContentSwitcher>
            )}
            {config.showRecommendedVisitTypeTab && contentSwitcherIndex === 0 && (
              <RecommendedVisitTypeSelector
                onChange={(visitType) => {
                  setVisitType(visitType);
                  setIsMissingVisitType(false);
                }}
                patientUuid={patientUuid}
                patientProgram={enrollment}
                locationUuid={selectedLocation}
              />
            )}
            {(!config.showRecommendedVisitTypeTab || contentSwitcherIndex === 1) && (
              <VisitTypeSelector
                onChange={(visitType) => {
                  setVisitType(visitType);
                  setIsMissingVisitType(false);
                }}
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

          <VisitFormQueueFields setFormFields={setVisitFormFields} />
          <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
            <Button className={styles.button} kind="secondary" onClick={closeWorkspace}>
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

export default VisitForm;
