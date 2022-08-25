import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import {
  Button,
  ButtonSet,
  ContentSwitcher,
  DatePicker,
  DatePickerInput,
  RadioButton,
  RadioButtonGroup,
  Select,
  SelectItem,
  Switch,
  TextArea,
  TimePicker,
  TimePickerSelect,
  Toggle,
  TextInput,
  Layer,
} from '@carbon/react';
import {
  useLocations,
  useSession,
  showToast,
  showNotification,
  ExtensionSlot,
  usePatient,
  useConfig,
  parseDate,
} from '@openmrs/esm-framework';
import { AppointmentPayload, MappedAppointment } from '../types';
import { amPm } from '../helpers';
import { saveAppointment, useServices } from './appointment-forms.resource';
import { ConfigObject } from '../config-schema';
import { useProviders } from '../hooks/useProviders';
import { closeOverlay } from '../hooks/useOverlay';
import { mockFrequency } from '../../__mocks__/appointments.mock';
import styles from './edit-appointment-form.scss';

interface FollowUpFormProps {
  appointment: MappedAppointment;
  mutate: () => void;
}
const FollowUpForm: React.FC<FollowUpFormProps> = ({ appointment, mutate = () => {} }) => {
  const { t } = useTranslation();
  const { patient } = usePatient(appointment.patientUuid);
  const session = useSession();
  const { providers } = useProviders();
  const { services } = useServices();
  const [selectedLocation, setSelectedLocation] = useState(appointment.location);
  const [selectedService, setSelectedService] = useState(appointment.serviceUuid);
  const [selectedProvider, setSelectedProvider] = useState(session?.currentProvider?.uuid);
  const [reminder, setReminder] = useState('');
  const [typeOfTracing, setTypeOfTracing] = useState('');
  const [tracingOutcome, setTracingOutcome] = useState('');
  const [finalOutcome, setFinalOutcome] = useState('');
  const [outComeTrueStatus, setOutComeTrueStatus] = useState('');
  const [other, setOther] = useState('');
  const [appointmentComment, setAppointmentComment] = useState(appointment.comments);
  const [followUpComment, setfollowUpComment] = useState('');
  const [reason, setReason] = useState('');
  const [timeFormat, setTimeFormat] = useState<amPm>(new Date().getHours() >= 12 ? 'PM' : 'AM');
  const [visitDate, setVisitDate] = React.useState<Date>(appointment.dateTime ? parseDate(appointment.dateTime) : null);
  const [isFullDay, setIsFullDay] = useState<boolean>(false);
  const [day, setDay] = useState(appointment.dateTime);
  const [tracingNumbering, setTracingNumbering] = useState('');
  const [appointmentKind, setAppointmentKind] = useState(appointment.appointmentKind);
  const [appointmentStatus, setAppointmentStatus] = useState(appointment.status);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedLocation && session?.sessionLocation?.uuid) {
      setSelectedLocation(session?.sessionLocation?.uuid);
    }
  }, [selectedLocation, session]);

  const handleSubmit = () => {
    const visitDatetime = dayjs(visitDate.setHours(0, 0, 0, 0)).format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
    const providerUuid = providers.find((provider) => provider.display === selectedProvider)?.uuid;

    const appointmentPayload: AppointmentPayload = {
      appointmentKind: appointmentKind,
      status: appointmentStatus,
      serviceUuid: selectedService,
      startDateTime: dayjs(visitDatetime).format(),
      endDateTime: dayjs(visitDatetime).format(),
      providerUuid: providerUuid,
      comments: appointmentComment,
      locationUuid: selectedLocation,
      patientUuid: appointment.patientUuid,
      appointmentNumber: appointment.appointmentNumber,
      uuid: appointment.id,
    };

    const abortController = new AbortController();
    setIsSubmitting(true);
    saveAppointment(appointmentPayload, abortController).then(
      ({ status }) => {
        if (status === 200) {
          showToast({
            critical: true,
            kind: 'success',
            description: t('appointmentNowVisible', 'It is now visible on the Appointments page'),
            title: t('appointmentScheduled', 'Appointment scheduled'),
          });
          setIsSubmitting(false);
          mutate();
          closeOverlay();
        }
      },
      (error) => {
        showNotification({
          title: t('FollowUpFormError', 'Error scheduling appointment'),
          kind: 'error',
          critical: true,
          description: error?.message,
        });
        setIsSubmitting(false);
      },
    );
  };

  return (
    <div className={styles.formContainer}>
      <ExtensionSlot
        extensionSlotName="patient-header-slot"
        state={{
          patient,
          patientUuid: appointment.patientUuid,
        }}
      />
      <p>{t('typeOfTracing', 'Type of Tracing')}</p>
      <RadioButtonGroup
        defaultSelected="Treatment Supporter"
        orientation="vertical"
        className={styles.inputContainer}
        onChange={(event) => {
          setTypeOfTracing(event.toString());
        }}
        name="type-of-tracing-radio-group">
        <RadioButton className={styles.radioButton} id="clientCalled" labelText="Client Called" value="Client Called" />
        <RadioButton
          className={styles.radioButton}
          id="physicalTracing"
          labelText="Physical Tracing"
          value="Physical Tracing"
        />
        <RadioButton
          className={styles.radioButton}
          id="treatmentSupporter"
          labelText="Treatment Supporter"
          value="Treatment Supporter"
        />
      </RadioButtonGroup>
      <p>{t('tracingOutcome', 'Tracing Outcome')}</p>
      <RadioButtonGroup
        defaultSelected="Informant Not Contacted"
        orientation="vertical"
        className={styles.inputContainer}
        onChange={(event) => {
          setTracingOutcome(event.toString());
        }}
        name="tracing-outcome-radio-group">
        <RadioButton
          className={styles.radioButton}
          id="clientContacted"
          labelText="Client Contacted"
          value="Client Contacted"
        />
        <RadioButton
          className={styles.radioButton}
          id="clientNotContacted"
          labelText="Client Not Contacted "
          value="Client Not Contacted"
        />
        <RadioButton
          className={styles.radioButton}
          id="informantContacted"
          labelText="Informant Contacted"
          value="Informant Contacted"
        />
        <RadioButton
          className={styles.radioButton}
          id="InformantNotContacted"
          labelText="Informant Not Contacted"
          value="Informant Not Contacted"
        />
      </RadioButtonGroup>
      <p>{t('datePromissedToCome', 'Date promised to come')}</p>
      <div className={styles.row}>
        <DatePicker
          dateFormat="d/m/Y"
          datePickerType="single"
          id="visitDate"
          light
          style={{ paddingBottom: '1rem' }}
          minDate={new Date().toISOString()}
          onChange={([date]) => setVisitDate(date)}
          value={visitDate}>
          <DatePickerInput id="visitStartDateInput" placeholder="dd/mm/yyyy" style={{ width: '100%' }} />
        </DatePicker>
      </div>
      <p>{t('tracingNumbering', 'Tracing Numbering.')}</p>
      <Layer>
        <TextInput
          className={styles.input}
          id="tracingNumberingParagraph"
          labelText={t(
            'tracingNumberingParagraph',
            'Please specify the attempt number since last missed appointment (i.e 1,2,3).',
          )}
          onChange={(event) => setTracingNumbering(event.target.value)}
          value={tracingNumbering}
        />
      </Layer>
      <p>{t('finalOutCome', 'Was the final outcome reached?')}</p>
      <RadioButtonGroup
        defaultSelected="No"
        orientation="vertical"
        className={styles.inputContainer}
        onChange={(event) => {
          setFinalOutcome(event.toString());
        }}
        name="final-outcome-radio-group">
        <RadioButton className={styles.radioButton} id="Yes" labelText="Yes" value="Yes" />
        <RadioButton className={styles.radioButton} id="No" labelText="No" value="No" />
      </RadioButtonGroup>
      <p>{t('outcomeStatus', 'Outcome/ True Status')}</p>
      <RadioButtonGroup
        defaultSelected="Stopped Treatment"
        orientation="vertical"
        className={styles.inputContainer}
        onChange={(event) => {
          setOutComeTrueStatus(event.toString());
        }}
        name="outcome-status-radio-group">
        <RadioButton className={styles.radioButton} id="dead" labelText="Dead" value="Dead" />
        <RadioButton
          className={styles.radioButton}
          id="receiveArt"
          labelText="Receiving ART from another clinic/Transfered"
          value="Receiving ART from another clinic/Transfered"
        />
        <RadioButton
          className={styles.radioButton}
          id="stillInCare"
          labelText="Still in care at CCC"
          value="Still in care at CCC"
        />
        <RadioButton
          className={styles.radioButton}
          id="lostToFollow"
          labelText="Lost to follow up"
          value="Lost to follow up"
        />
        <RadioButton
          className={styles.radioButton}
          id="StoppedTreatment"
          labelText="Stopped Treatment"
          value="Stopped Treatment"
        />
        <RadioButton
          className={styles.radioButton}
          id="other"
          labelText="Other - Please Explain"
          value="Other - Please Explain"
        />
      </RadioButtonGroup>
      <Layer>
        <TextInput
          className={styles.input}
          id="other"
          onChange={(event) => setOther(event.target.value)}
          value={other}
        />
      </Layer>
      <TextArea
        id="followComment"
        light
        value={followUpComment}
        className={styles.inputContainer}
        labelText={t('comments', 'Provide Comments')}
        onChange={(event) => setfollowUpComment(event.target.value)}
      />
      <ButtonSet>
        <Button onClick={closeOverlay} className={styles.button} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button onClick={handleSubmit} className={styles.button} disabled={isSubmitting} kind="primary" type="submit">
          {t('save', 'Save Form')}
        </Button>
      </ButtonSet>
    </div>
  );
};

export default FollowUpForm;
