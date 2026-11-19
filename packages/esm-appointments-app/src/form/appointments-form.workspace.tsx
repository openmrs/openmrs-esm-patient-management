import React, { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Controller, useController, useForm, type Control, type FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  Button,
  ButtonSet,
  Form,
  FormGroup,
  InlineLoading,
  MultiSelect,
  NumberInput,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  Stack,
  TextArea,
  TimePicker,
  TimePickerSelect,
  Toggle,
} from '@carbon/react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  OpenmrsDatePicker,
  OpenmrsDateRangePicker,
  ResponsiveWrapper,
  showSnackbar,
  translateFrom,
  useConfig,
  useLayoutType,
  useLocations,
  usePatient,
  useSession,
  Workspace2,
  type Workspace2DefinitionProps,
  type FetchResponse,
} from '@openmrs/esm-framework';
import { z } from 'zod';
import { type ConfigObject } from '../config-schema';
import type { Appointment, AppointmentPayload, RecurringPattern } from '../types';
import { checkAppointmentConflict, saveAppointment, saveRecurringAppointments } from './appointments-form.resource';
import { useAppointmentServices } from '../hooks/useAppointmentService';
import { appointmentLocationTagName, dateFormat, moduleName, weekDays } from '../constants';
import { useProviders } from '../hooks/useProviders';
import { useMutateAppointments } from '../hooks/useMutateAppointments';
import Workload from '../workload/workload.component';
import { useSelectedDate } from '../hooks/useSelectedDate';
import styles from './appointments-form.scss';

interface AppointmentsFormProps {
  appointment?: Appointment;
  recurringPattern?: RecurringPattern;
  patientUuid: string;
}

interface PatientRecord {
  name?: string | Array<{ text?: string; family?: string; given?: Array<string> }>;
  display?: string;
  gender?: string;
  sex?: string;
  age?: number | string;
  birthDate?: string;
  identifier?: string | { identifier?: string; value?: string };
  identifiers?: Array<{ identifier?: string; value?: string }>;
  person?: {
    names?: Array<{ givenName?: string; familyName?: string }>;
  };
}

const time12HourFormatRegexPattern = '^(1[0-2]|0?[1-9]):[0-5][0-9]$';
const time12HourFormatRegex = /^(1[0-2]|0?[1-9]):[0-5][0-9]$/;

export const appointmentsFormSchema = z
  .object({
    duration: z.union([z.number(), z.null()]).optional(),
    isAllDayAppointment: z.boolean(),
    location: z.string().refine((val) => val !== '', {
      message: translateFrom(moduleName, 'locationRequired', 'Location is required'),
    }),
    provider: z.string().refine((val) => val !== '', {
      message: translateFrom(moduleName, 'providerRequired', 'Provider is required'),
    }),
    appointmentStatus: z.string().optional(),
    appointmentNote: z.string(),
    appointmentType: z.string().refine((val) => val !== '', {
      message: translateFrom(moduleName, 'appointmentTypeRequired', 'Appointment type is required'),
    }),
    selectedService: z.string().refine((val) => val !== '', {
      message: translateFrom(moduleName, 'serviceRequired', 'Service is required'),
    }),
    recurringPatternType: z.enum(['DAY', 'WEEK']),
    recurringPatternPeriod: z.number(),
    recurringPatternDaysOfWeek: z.array(z.string()),
    selectedDaysOfWeekText: z.string().optional(),
    startTime: z.string().refine((val) => time12HourFormatRegex.test(val), {
      message: translateFrom(moduleName, 'invalidTime', 'Invalid time'),
    }),
    timeFormat: z.enum(['AM', 'PM']),
    appointmentDateTime: z.object({
      startDate: z.date(),
      startDateText: z.string(),
      recurringPatternEndDate: z.date().nullable(),
      recurringPatternEndDateText: z.string().nullable(),
    }),
    formIsRecurringAppointment: z.boolean(),
    dateAppointmentScheduled: z.date().optional(),
  })
  .refine(
    (vals) =>
      !vals.formIsRecurringAppointment || z.date().safeParse(vals.appointmentDateTime.recurringPatternEndDate).success,
    {
      path: ['appointmentDateTime.recurringPatternEndDate'],
      message: translateFrom(
        moduleName,
        'recurringAppointmentShouldHaveEndDate',
        'A recurring appointment should have an end date',
      ),
    },
  )
  .refine(
    ({ appointmentDateTime, dateAppointmentScheduled }) => {
      if (!appointmentDateTime?.startDate || !dateAppointmentScheduled) return true;
      return (
        new Date(dateAppointmentScheduled).setHours(0, 0, 0, 0) <=
        new Date(appointmentDateTime.startDate).setHours(0, 0, 0, 0)
      );
    },
    {
      path: ['dateAppointmentScheduled'],
      message: translateFrom(
        moduleName,
        'dateAppointmentIssuedCannotBeAfterAppointmentDate',
        'Date appointment issued cannot be after the appointment date',
      ),
    },
  )
  .superRefine((data, ctx) => {
    if (!data.isAllDayAppointment && (!data.duration || data.duration <= 0)) {
      ctx.addIssue({
        path: ['duration'],
        code: z.ZodIssueCode.custom,
        message: translateFrom(moduleName, 'durationErrorMessage', 'Duration should be greater than zero'),
      });
    }
    if (!data.isAllDayAppointment && data.duration && data.duration > 1440) {
      ctx.addIssue({
        path: ['duration'],
        code: z.ZodIssueCode.custom,
        message: translateFrom(moduleName, 'durationMaxErrorMessage', 'Duration cannot exceed 1440 minutes (24 hours)'),
      });
    }
  });

export type AppointmentFormData = z.infer<typeof appointmentsFormSchema>;

const AppointmentsForm: React.FC<Workspace2DefinitionProps<AppointmentsFormProps>> = ({
  workspaceProps,
  closeWorkspace,
}) => {
  const { appointment, recurringPattern, patientUuid } =
    (workspaceProps as AppointmentsFormProps) || ({} as AppointmentsFormProps);
  const { patient } = usePatient(patientUuid ?? '');
  const { mutateAppointments } = useMutateAppointments();
  const { t } = useTranslation();
  const isTablet = useLayoutType() === 'tablet';
  const locations = useLocations(appointmentLocationTagName);
  const providers = useProviders();
  const session = useSession();
  const selectedDate = useSelectedDate();
  const { serviceTypes, isLoading } = useAppointmentServices();
  const { appointmentStatuses, appointmentTypes, allowAllDayAppointments } = useConfig<ConfigObject>();

  const [isRecurringAppointment, setIsRecurringAppointment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultStartDate = appointment?.startDateTime
    ? new Date(appointment.startDateTime)
    : selectedDate
      ? dayjs(selectedDate).toDate()
      : new Date();
  const defaultEndDate = recurringPattern?.endDate ? new Date(recurringPattern.endDate) : null;
  const isEditing = Boolean(appointment);

  const {
    control,
    getValues,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AppointmentFormData>({
    mode: 'all',
    resolver: zodResolver(appointmentsFormSchema),
    defaultValues: {
      location: appointment?.location?.uuid ?? session?.sessionLocation?.uuid ?? '',
      provider:
        appointment?.providers?.find((p: { response?: string; uuid?: string }) => p.response === 'ACCEPTED')?.uuid ??
        session?.currentProvider?.uuid ??
        '',
      appointmentNote: appointment?.comments || '',
      appointmentStatus: appointment?.status || '',
      appointmentType: appointment?.appointmentKind || (appointmentTypes?.length === 1 ? appointmentTypes[0] : ''),
      selectedService: appointment?.service?.name || (serviceTypes?.length === 1 ? serviceTypes[0].name : ''),
      recurringPatternType: recurringPattern?.type || 'DAY',
      recurringPatternPeriod: recurringPattern?.period || 1,
      recurringPatternDaysOfWeek: recurringPattern?.daysOfWeek || [],
      startTime: dayjs(appointment?.startDateTime ? new Date(appointment.startDateTime) : new Date()).format('hh:mm'),
      duration:
        appointment?.startDateTime && appointment?.endDateTime
          ? dayjs(appointment.endDateTime).diff(dayjs(appointment.startDateTime), 'minutes')
          : undefined,
      timeFormat: new Date(appointment?.startDateTime || new Date()).getHours() >= 12 ? 'PM' : 'AM',
      appointmentDateTime: {
        startDate: defaultStartDate,
        startDateText: dayjs(defaultStartDate).format(dateFormat),
        recurringPatternEndDate: defaultEndDate,
        recurringPatternEndDateText: defaultEndDate ? dayjs(defaultEndDate).format(dateFormat) : '',
      },
      formIsRecurringAppointment: isRecurringAppointment,
      dateAppointmentScheduled: appointment?.dateAppointmentScheduled
        ? new Date(appointment.dateAppointmentScheduled)
        : new Date(),
      isAllDayAppointment: allowAllDayAppointments,
    },
  });

  useEffect(() => setValue('formIsRecurringAppointment', isRecurringAppointment), [isRecurringAppointment, setValue]);

  const {
    field: { ref: startDateRef },
  } = useController({ name: 'appointmentDateTime.startDate', control });
  const {
    field: { ref: endDateRef },
  } = useController({ name: 'appointmentDateTime.recurringPatternEndDate', control });

  useEffect(() => {
    startDateRef(document.getElementById('startDatePickerInput'));
    endDateRef(document.getElementById('endDatePickerInput'));
  }, [startDateRef, endDateRef]);

  const handleSaveAppointment = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    const appointmentPayload: AppointmentPayload = {
      appointmentKind: data.appointmentType,
      status: data.appointmentStatus,
      serviceUuid: serviceTypes?.find((s) => s.name === data.selectedService)?.uuid ?? '',
      startDateTime: dayjs(
        data.appointmentDateTime.startDate.setHours(
          (parseInt(data.startTime.split(':')[0], 10) % 12) + (data.timeFormat === 'PM' ? 12 : 0),
          parseInt(data.startTime.split(':')[1], 10),
        ),
      ).format(),
      endDateTime: dayjs(
        data.isAllDayAppointment
          ? dayjs(data.appointmentDateTime.startDate).endOf('day').toDate()
          : dayjs(data.appointmentDateTime.startDate)
              .add(data.duration || 0, 'minutes')
              .toDate(),
      ).format(),
      locationUuid: data.location,
      providers: [{ uuid: data.provider }],
      patientUuid,
      comments: data.appointmentNote,
      uuid: isEditing ? appointment?.uuid : undefined,
      dateAppointmentScheduled: dayjs(data.dateAppointmentScheduled).format(),
    };

    const conflictRes: FetchResponse = await checkAppointmentConflict(appointmentPayload);
    let errorMsg = conflictRes.data?.hasOwnProperty('SERVICE_UNAVAILABLE')
      ? t('serviceUnavailable', 'Appointment time is outside of service hours')
      : conflictRes.data?.hasOwnProperty('PATIENT_DOUBLE_BOOKING')
        ? t('patientDoubleBooking', 'Patient already booked for an appointment at this time')
        : null;

    if (conflictRes.status === 200 && errorMsg) {
      setIsSubmitting(false);
      showSnackbar({ isLowContrast: true, kind: 'error', title: errorMsg });
      return;
    }

    const abortController = new AbortController();
    const savePromise = isRecurringAppointment
      ? saveRecurringAppointments(
          {
            appointmentRequest: appointmentPayload,
            recurringPattern: {
              type: data.recurringPatternType,
              period: data.recurringPatternPeriod,
              endDate: data.appointmentDateTime.recurringPatternEndDate
                ? dayjs(data.appointmentDateTime.recurringPatternEndDate).format()
                : '',
              daysOfWeek: data.recurringPatternDaysOfWeek,
            },
          },
          abortController,
        )
      : saveAppointment(appointmentPayload, abortController);

    savePromise
      .then(({ status }) => {
        setIsSubmitting(false);
        if (status === 200) {
          reset();
          mutateAppointments();
          closeWorkspace({ discardUnsavedChanges: true, closeWindow: true });
          showSnackbar({
            isLowContrast: true,
            kind: 'success',
            subtitle: t('appointmentNowVisible', 'It is now visible on the Appointments page'),
            title: isEditing
              ? t('appointmentEdited', 'Appointment edited')
              : t('appointmentScheduled', 'Appointment scheduled'),
          });
        } else if (status === 204) {
          showSnackbar({
            title: isEditing
              ? t('appointmentEditError', 'Error editing appointment')
              : t('appointmentFormError', 'Error scheduling appointment'),
            kind: 'error',
            isLowContrast: false,
            subtitle: t('noContent', 'No Content'),
          });
        }
      })
      .catch((err: Error) => {
        setIsSubmitting(false);
        showSnackbar({
          title: isEditing
            ? t('appointmentEditError', 'Error editing appointment')
            : t('appointmentFormError', 'Error scheduling appointment'),
          kind: 'error',
          isLowContrast: false,
          subtitle: err?.message,
        });
      });
  };

  const title = isEditing
    ? t('editAppointment', 'Edit appointment')
    : t('createNewAppointment', 'Create new appointment');

  if (isLoading) {
    return (
      <Workspace2 title={title}>
        <InlineLoading className={styles.loader} description={`${t('loading', 'Loading')} ...`} role="progressbar" />
      </Workspace2>
    );
  }

  const apptPatient = appointment?.patient as unknown as PatientRecord | undefined;
  const pRaw = (patient as unknown as PatientRecord | undefined) || apptPatient;

  const rawNameEntry = pRaw?.name;
  const pName: string =
    typeof apptPatient?.name === 'string' && apptPatient.name
      ? apptPatient.name
      : typeof rawNameEntry === 'string' && rawNameEntry
        ? rawNameEntry
        : typeof pRaw?.display === 'string' && pRaw.display
          ? pRaw.display
          : Array.isArray(rawNameEntry) && rawNameEntry[0]
            ? typeof rawNameEntry[0] === 'string'
              ? rawNameEntry[0]
              : [rawNameEntry[0]?.given?.join(' '), rawNameEntry[0]?.family].filter(Boolean).join(' ') ||
                rawNameEntry[0]?.text ||
                ''
            : [pRaw?.person?.names?.[0]?.givenName, pRaw?.person?.names?.[0]?.familyName].filter(Boolean).join(' ') ||
              '';

  const pParts = pName.trim() ? pName.trim().split(/\s+/) : [];
  const pInitials =
    pParts.length >= 2
      ? `${pParts[0][0]}${pParts[1][0]}`.toUpperCase()
      : pName.trim().length > 0
        ? pName.trim().slice(0, 2).toUpperCase()
        : 'PT';

  const rawGen = apptPatient?.gender || apptPatient?.sex || pRaw?.gender || pRaw?.sex || '';
  const pGender =
    rawGen === 'M' || rawGen.toLowerCase() === 'male'
      ? 'Male'
      : rawGen === 'F' || rawGen.toLowerCase() === 'female'
        ? 'Female'
        : rawGen;

  const rawBirthDate = apptPatient?.birthDate || pRaw?.birthDate;
  const pBirthDate = rawBirthDate ? dayjs(rawBirthDate).format('DD-MMM-YYYY') : '';

  const rawAge =
    apptPatient?.age ?? pRaw?.age ?? (rawBirthDate ? dayjs().diff(dayjs(rawBirthDate), 'year') : undefined);
  const pAge = rawAge !== undefined && rawAge !== null && rawAge !== '' ? `${rawAge} yrs` : '';

  const rawId = apptPatient?.identifier || apptPatient?.identifiers?.[0] || pRaw?.identifier || pRaw?.identifiers?.[0];

  const pId: string =
    typeof rawId === 'string'
      ? rawId
      : typeof rawId?.value === 'string'
        ? rawId.value
        : typeof rawId?.identifier === 'string'
          ? rawId.identifier
          : patientUuid?.slice(0, 7) || '—';

  return (
    <Workspace2 title={title} hasUnsavedChanges={isDirty}>
      <Form onSubmit={handleSubmit(handleSaveAppointment)}>
        {(patient || apptPatient) && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.875rem',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #e0e0e0',
              backgroundColor: '#fff',
            }}>
            <div
              style={{
                width: '3.25rem',
                height: '3.25rem',
                backgroundColor: '#589694',
                color: '#fff',
                fontSize: '1.125rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
              {pInitials}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#161616' }}>{pName}</span>
                {pGender && <span style={{ fontSize: '0.875rem', color: '#525252' }}>{pGender}</span>}
              </div>
              {(pAge || pBirthDate) && (
                <div style={{ fontSize: '0.8125rem', color: '#525252' }}>
                  {[pAge, pBirthDate].filter(Boolean).join(' · ')}
                </div>
              )}
              <div
                style={{
                  marginTop: '0.25rem',
                  alignSelf: 'flex-start',
                  backgroundColor: '#e8e8e8',
                  padding: '0.125rem 0.625rem',
                  borderRadius: '1rem',
                  fontSize: '0.75rem',
                  color: '#525252',
                }}>
                <span>OpenMRS ID: </span>
                <strong style={{ color: '#161616' }}>{pId}</strong>
              </div>
            </div>
          </div>
        )}

        <Stack className={styles.formWrapper} gap={6}>
          <FormGroup className={styles.formGroup} legendText={t('location', 'Location')}>
            <ResponsiveWrapper>
              <Controller
                name="location"
                control={control}
                render={({ field }) => (
                  <Select
                    id="location"
                    invalid={!!errors?.location}
                    invalidText={errors?.location?.message}
                    labelText={t('selectALocation', 'Select a location')}
                    {...field}>
                    <SelectItem key="chooseLocation" text={t('chooseLocation', 'Choose a location')} value="" />
                    {locations?.map((loc) => (
                      <SelectItem key={loc.uuid} text={loc.display ?? ''} value={loc.uuid} />
                    ))}
                  </Select>
                )}
              />
            </ResponsiveWrapper>
          </FormGroup>

          <FormGroup className={styles.formGroup} legendText={t('service', 'Service')}>
            <ResponsiveWrapper>
              <Controller
                name="selectedService"
                control={control}
                render={({ field }) => (
                  <Select
                    id="service"
                    invalid={!!errors?.selectedService}
                    invalidText={errors?.selectedService?.message}
                    labelText={t('selectService', 'Select a service')}
                    {...field}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      const dur = serviceTypes?.find((s) => s.name === e.target.value)?.durationMins;
                      if (
                        !isEditing ||
                        (dur &&
                          serviceTypes?.find((s) => s.name === getValues('selectedService'))?.durationMins ===
                            getValues('duration'))
                      ) {
                        setValue('duration', dur);
                      }
                      field.onChange(e);
                    }}>
                    <SelectItem key="chooseService" text={t('chooseService', 'Select service')} value="" />
                    {serviceTypes?.map((s) => (
                      <SelectItem key={s.uuid} text={s.name} value={s.name} />
                    ))}
                  </Select>
                )}
              />
            </ResponsiveWrapper>
          </FormGroup>

          <FormGroup className={styles.formGroup} legendText={t('appointmentType_title', 'Appointment Type')}>
            <ResponsiveWrapper>
              <Controller
                name="appointmentType"
                control={control}
                render={({ field }) => (
                  <Select
                    disabled={!appointmentTypes?.length}
                    id="appointmentType"
                    invalid={!!errors?.appointmentType}
                    invalidText={errors?.appointmentType?.message}
                    labelText={t('selectAppointmentType', 'Select the type of appointment')}
                    {...field}>
                    <SelectItem text={t('chooseAppointmentType', 'Choose appointment type')} value="" />
                    {appointmentTypes?.map((type) => (
                      <SelectItem key={type} text={t(type)} value={type} />
                    ))}
                  </Select>
                )}
              />
            </ResponsiveWrapper>
          </FormGroup>

          <FormGroup className={styles.formGroup} legendText={t('recurringAppointment', 'Recurring Appointment')}>
            <Toggle
              id="recurringToggle"
              labelB={t('yes', 'Yes')}
              labelA={t('no', 'No')}
              labelText={t('isRecurringAppointment', 'Is this a recurring appointment?')}
              onClick={() => setIsRecurringAppointment(!isRecurringAppointment)}
            />
          </FormGroup>

          <FormGroup className={styles.formGroup} legendText={t('dateTime', 'Appointment time')}>
            <div className={styles.dateTimeFields}>
              {isRecurringAppointment ? (
                <div className={styles.inputContainer}>
                  {allowAllDayAppointments && (
                    <Controller
                      name="isAllDayAppointment"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Toggle
                          id="allDayToggle"
                          labelA={t('no', 'No')}
                          labelB={t('yes', 'Yes')}
                          labelText={t('allDay', 'All day')}
                          toggled={value}
                          onToggle={onChange}
                        />
                      )}
                    />
                  )}
                  <ResponsiveWrapper>
                    <Controller
                      name="appointmentDateTime"
                      control={control}
                      render={({ field: { onChange, value }, fieldState }) => (
                        <OpenmrsDateRangePicker
                          value={
                            value?.startDate && value?.recurringPatternEndDate
                              ? [value.startDate, value.recurringPatternEndDate]
                              : undefined
                          }
                          onChange={([startDate, endDate]) => {
                            onChange({
                              ...value,
                              startDate,
                              startDateText: startDate ? dayjs(startDate).format(dateFormat) : '',
                              recurringPatternEndDate: endDate,
                              recurringPatternEndDateText: endDate ? dayjs(endDate).format(dateFormat) : '',
                            });
                          }}
                          startName="start"
                          endName="end"
                          id="appointmentRecurringDateRangePicker"
                          data-testid="appointmentRecurringDateRangePicker"
                          labelText={t('dateRange', 'Set date range')}
                          invalid={!!fieldState?.error?.message}
                          invalidText={fieldState?.error?.message}
                          isRequired
                        />
                      )}
                    />
                  </ResponsiveWrapper>

                  {!watch('isAllDayAppointment') && <TimeAndDuration t={t} control={control} errors={errors} />}

                  <ResponsiveWrapper>
                    <Controller
                      name="recurringPatternPeriod"
                      control={control}
                      render={({ field: { onBlur, onChange, value } }) => (
                        <NumberInput
                          hideSteppers
                          id="repeatNumber"
                          min={1}
                          max={356}
                          label={t('repeatEvery', 'Repeat every')}
                          invalidText={t('invalidNumber', 'Number is not valid')}
                          value={value}
                          onBlur={onBlur}
                          onChange={(e, state) =>
                            onChange(
                              (state?.value ?? (e.target as HTMLInputElement).value) === ''
                                ? null
                                : Number(state?.value ?? (e.target as HTMLInputElement).value),
                            )
                          }
                        />
                      )}
                    />
                  </ResponsiveWrapper>

                  <ResponsiveWrapper>
                    <Controller
                      name="recurringPatternType"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                        <RadioButtonGroup
                          aria-label={t('period', 'Period')}
                          name="radio-button-group"
                          onChange={(type) => onChange(type)}
                          valueSelected={value}>
                          <RadioButton labelText={t('day', 'Day')} value="DAY" id="radioDay" />
                          <RadioButton labelText={t('week', 'Week')} value="WEEK" id="radioWeek" />
                        </RadioButtonGroup>
                      )}
                    />
                  </ResponsiveWrapper>

                  {watch('recurringPatternType') === 'WEEK' && (
                    <Controller
                      name="selectedDaysOfWeekText"
                      control={control}
                      defaultValue={
                        weekDays
                          .filter((i) => getValues('recurringPatternDaysOfWeek').includes(i.id))
                          .map((w) => w.label)
                          .join(', ') || t('daysOfWeek', 'Days of the week')
                      }
                      render={({ field: { onChange } }) => (
                        <MultiSelect
                          className={styles.weekSelect}
                          id="daysOfWeek"
                          initialSelectedItems={weekDays.filter((i) =>
                            getValues('recurringPatternDaysOfWeek').includes(i.id),
                          )}
                          items={weekDays}
                          itemToString={(i) => (i ? t(i.labelCode, i.label) : '')}
                          label={getValues('selectedDaysOfWeekText') ?? ''}
                          onChange={(e) => {
                            onChange(
                              e?.selectedItems?.length
                                ? e.selectedItems.map((w) => w.label).join(', ')
                                : t('daysOfWeek', 'Days of the week'),
                            );
                            setValue(
                              'recurringPatternDaysOfWeek',
                              e.selectedItems?.map((s: { id: string }) => s.id) ?? [],
                            );
                          }}
                          selectionFeedback="top-after-reopen"
                          sortItems={(items) => [...items].sort((a, b) => a.order - b.order)}
                        />
                      )}
                    />
                  )}
                </div>
              ) : (
                <div className={styles.inputContainer}>
                  {allowAllDayAppointments && (
                    <Controller
                      name="isAllDayAppointment"
                      control={control}
                      render={({ field: { value, onChange } }) => (
                        <Toggle
                          id="allDayToggle"
                          labelA={t('no', 'No')}
                          labelB={t('yes', 'Yes')}
                          labelText={t('allDay', 'All day')}
                          toggled={value}
                          onToggle={onChange}
                        />
                      )}
                    />
                  )}
                  <ResponsiveWrapper>
                    <Controller
                      name="appointmentDateTime"
                      control={control}
                      render={({ field, fieldState }) => (
                        <OpenmrsDatePicker
                          data-testid="datePickerInput"
                          id="datePickerInput"
                          invalid={!!fieldState?.error?.message}
                          invalidText={fieldState?.error?.message}
                          labelText={t('date', 'Date')}
                          onBlur={field.onBlur}
                          onChange={(date) => field.onChange({ ...field.value, startDate: date })}
                          style={{ width: '100%' }}
                          value={field.value.startDate}
                        />
                      )}
                    />
                  </ResponsiveWrapper>

                  {!watch('isAllDayAppointment') && <TimeAndDuration t={t} control={control} errors={errors} />}
                </div>
              )}
            </div>
          </FormGroup>

          {getValues('selectedService') && (
            <FormGroup className={styles.formGroup} legendText="">
              <ResponsiveWrapper>
                <Workload
                  appointmentDate={watch('appointmentDateTime').startDate}
                  onWorkloadDateChange={(date) =>
                    setValue('appointmentDateTime', { ...getValues('appointmentDateTime'), startDate: date })
                  }
                  selectedService={watch('selectedService')}
                />
              </ResponsiveWrapper>
            </FormGroup>
          )}

          {isEditing && (
            <FormGroup className={styles.formGroup} legendText={t('appointmentStatus', 'Appointment Status')}>
              <ResponsiveWrapper>
                <Controller
                  name="appointmentStatus"
                  control={control}
                  render={({ field }) => (
                    <Select
                      id="appointmentStatus"
                      invalid={!!errors?.appointmentStatus}
                      invalidText={errors?.appointmentStatus?.message}
                      labelText={t('selectAppointmentStatus', 'Select status')}
                      {...field}>
                      <SelectItem
                        key="selectAppointmentStatus"
                        text={t('selectAppointmentStatus', 'Select status')}
                        value=""
                      />
                      {appointmentStatuses?.map((st) => (
                        <SelectItem key={st} text={t(st)} value={st} />
                      ))}
                    </Select>
                  )}
                />
              </ResponsiveWrapper>
            </FormGroup>
          )}

          <FormGroup className={styles.formGroup} legendText={t('provider', 'Provider')}>
            <ResponsiveWrapper>
              <Controller
                name="provider"
                control={control}
                render={({ field }) => (
                  <Select
                    id="provider"
                    invalidText="Required"
                    labelText={t('selectProvider', 'Select a provider')}
                    {...field}>
                    <SelectItem key="chooseProvider" text={t('chooseProvider', 'Choose a provider')} value="" />
                    {providers?.providers?.map((p) => (
                      <SelectItem key={p.uuid} text={p.display} value={p.uuid} />
                    ))}
                  </Select>
                )}
              />
            </ResponsiveWrapper>
          </FormGroup>

          <FormGroup
            className={styles.formGroup}
            legendText={t('dateAppointmentScheduled', 'Date appointment scheduled')}>
            <ResponsiveWrapper>
              <Controller
                name="dateAppointmentScheduled"
                control={control}
                render={({ field, fieldState }) => (
                  <div style={{ width: '100%' }}>
                    <OpenmrsDatePicker
                      data-testid="dateAppointmentScheduledPickerInput"
                      id="dateAppointmentScheduledPickerInput"
                      invalid={!!fieldState?.error?.message}
                      invalidText={fieldState?.error?.message}
                      labelText={t('dateAppointmentIssued', 'Date appointment issued')}
                      maxDate={new Date()}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      style={{ width: '100%' }}
                      value={field.value}
                    />
                  </div>
                )}
              />
            </ResponsiveWrapper>
          </FormGroup>

          <FormGroup className={styles.formGroup} legendText={t('note', 'Note')}>
            <ResponsiveWrapper>
              <Controller
                name="appointmentNote"
                control={control}
                render={({ field }) => (
                  <TextArea
                    enableCounter
                    id="appointmentNote"
                    labelText={t('appointmentNoteLabel', 'Write an additional note')}
                    placeholder={t('appointmentNotePlaceholder', 'Write any additional points here')}
                    maxCount={255}
                    {...field}
                  />
                )}
              />
            </ResponsiveWrapper>
          </FormGroup>
        </Stack>

        <ButtonSet className={isTablet ? styles.tablet : styles.desktop}>
          <Button
            className={styles.button}
            onClick={() => closeWorkspace({ discardUnsavedChanges: true })}
            kind="secondary">
            {t('discard', 'Discard')}
          </Button>
          <Button className={styles.button} disabled={isSubmitting} type="submit">
            {t('saveAndClose', 'Save and close')}
          </Button>
        </ButtonSet>
      </Form>
    </Workspace2>
  );
};

interface TimeAndDurationProps {
  t: ReturnType<typeof useTranslation>['t'];
  control: Control<AppointmentFormData>;
  errors: FieldErrors<AppointmentFormData>;
}

function TimeAndDuration({ t, control, errors }: TimeAndDurationProps) {
  return (
    <>
      <ResponsiveWrapper>
        <Controller
          name="startTime"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TimePicker
              id="time-picker"
              pattern={time12HourFormatRegexPattern}
              invalid={!!errors?.startTime}
              invalidText={errors?.startTime?.message ? String(errors.startTime.message) : undefined}
              labelText={t('time', 'Time')}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
              style={{ marginLeft: '0.125rem', flex: 'none' }}
              value={value}>
              <Controller
                name="timeFormat"
                control={control}
                render={({ field: { value: fVal, onChange: fOnChange } }) => (
                  <TimePickerSelect
                    id="time-picker-select-1"
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => fOnChange(e.target.value as 'AM' | 'PM')}
                    value={fVal}
                    aria-label={t('time', 'Time')}>
                    <SelectItem value="AM" text="AM" />
                    <SelectItem value="PM" text="PM" />
                  </TimePickerSelect>
                )}
              />
            </TimePicker>
          )}
        />
      </ResponsiveWrapper>
      <ResponsiveWrapper>
        <Controller
          name="duration"
          control={control}
          render={({ field }) => (
            <NumberInput
              allowEmpty
              disableWheel
              hideSteppers
              id="duration"
              invalid={!!errors?.duration}
              invalidText={errors?.duration?.message ? String(errors.duration.message) : undefined}
              label={t('durationInMinutes', 'Duration (minutes)')}
              {...field}
              onChange={(e, state) => {
                const val = state?.value ?? (e.target as HTMLInputElement).value;
                field.onChange(val === '' ? null : Number(val));
              }}
              value={field.value ?? ''}
            />
          )}
        />
      </ResponsiveWrapper>
    </>
  );
}

export default AppointmentsForm;
