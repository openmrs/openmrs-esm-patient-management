import React, { useState } from 'react';
import { Button, Form, ContentSwitcher, DatePicker, DatePickerInput, Switch, TextInput } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import styles from './patient-advanced-search.component.scss';
import { useLayoutType } from '@openmrs/esm-framework';
import { ArrowLeft16 } from '@carbon/icons-react';
import PatientSearchLaunch from '../patient-search/patient-search.component';
import Overlay from '../overlay.component';

interface PatientSearchLaunchProps {
  close: () => void;
}

const PatientAdvancedSearchLaunch: React.FC<PatientSearchLaunchProps> = ({ close }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(true);
  const [firstName, setFName] = useState('');
  const [middleName, setMName] = useState('');
  const [lastName, setLName] = useState('');
  const [sex, setSex] = useState('');
  const [dob, setDob] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [postCode, setPostalCode] = useState('');
  const [lastVisit, setLastVisit] = useState('');
  const [searchParams, setSearchParams] = useState([]);
  const [open, setOpen] = useState(false);

  const handleNewSearch = () => {
    setSearchParams([firstName, middleName, lastName, sex, dob, phoneNumber, postCode, lastVisit]);
  };

  return (
    <>
      <Overlay header={t('addPatientToListHeader', 'Add patient to list')} close={close}>
        <div className={`omrs-main-content ${styles.container}`}>
          {advancedOpen && (
            <div>
              <div className={styles.backButtonSet}>
                <ArrowLeft16
                  className={styles.backButton}
                  onClick={() => {
                    setOpen(true);
                    setAdvancedOpen(false);
                  }}
                />
                <Button
                  kind="ghost"
                  tooltipAlignment="start"
                  onClick={() => {
                    setOpen(true);
                    setAdvancedOpen(false);
                  }}>
                  {' '}
                  {t('backToSimpleSearch', 'Back to simple search')}
                </Button>
              </div>

              <div className={styles.searchFormTitle}>
                <span> Match </span>
                <ContentSwitcher className={styles.searchSwitch}>
                  <Switch name={'any'} text="Any" />
                  <Switch name={'all'} text="All" />
                </ContentSwitcher>
                <span> of the following fields : </span>
              </div>

              <Form className={styles.formStyle}>
                <p className={styles.searchPatient}> Name </p>

                <div className={styles.searchFormStyle}>
                  <TextInput
                    light
                    id="firstName"
                    labelText={t('firstNameLabelText', 'First Name')}
                    onChange={(event) => {
                      setFName(event.target.value);
                    }}
                  />
                </div>

                <div className={styles.searchFormStyle}>
                  <TextInput
                    light
                    id="middleName"
                    labelText={t('middleNameLabelText', 'Middle Name')}
                    onChange={(event) => {
                      setMName(event.target.value);
                    }}
                  />
                </div>

                <div className={styles.searchFormStyle}>
                  <TextInput
                    light
                    id="lastName"
                    labelText={t('lastNameLabelText', 'Last Name')}
                    onChange={(event) => {
                      setLName(event.target.value);
                    }}
                  />
                </div>

                <p className={styles.searchPatient}> Personal Details</p>
                <div className={styles.searchFormStyle}>
                  <span> Sex</span>
                  <ContentSwitcher>
                    <Switch name={'any'} text="Any" />
                    <Switch name={'male'} text="Male" />
                    <Switch name={'female'} text="Female" />
                  </ContentSwitcher>
                </div>

                <div className={styles.searchFormStyle}>
                  <DatePicker dateFormat="m/d/Y" datePickerType="simple" light>
                    <DatePickerInput
                      id="dob"
                      placeholder="mm/dd/yyyy"
                      labelText={t('dobLabelText', 'Date of Birth')}
                      type="date"
                      onChange={(event) => {
                        setDob(event.target.value);
                      }}
                    />
                  </DatePicker>
                </div>

                <div className={styles.searchFormStyle}>
                  <TextInput
                    light
                    id="phoneNumber"
                    labelText={t('phoneNumberLabelText', 'Phone Number')}
                    onChange={(event) => {
                      setPhoneNumber(event.target.value);
                    }}
                  />
                </div>

                <div className={styles.searchFormStyle}>
                  <TextInput
                    light
                    id="postCode"
                    labelText={t('postCodeLabelText', 'Post Code')}
                    onChange={(event) => {
                      setPostalCode(event.target.value);
                    }}
                  />
                </div>

                <p className={styles.searchPatient}> Last Visit</p>
                <DatePicker dateFormat="m/d/Y" datePickerType="simple" light className={styles.searchFormStyle}>
                  <DatePickerInput
                    id="lastVisit"
                    placeholder="mm/dd/yyyy"
                    labelText={t('lastVisitLabelText', 'Last Visit')}
                    type="date"
                    onChange={(event) => {
                      setLastVisit(event.target.value);
                    }}
                  />
                </DatePicker>
              </Form>

              <div className={styles.buttonsGroup}>
                <Button kind="secondary" size="lg">
                  {' '}
                  {t('cancel', 'Cancel')}
                </Button>
                <Button size="lg" onClick={() => handleNewSearch()}>
                  {t('save', 'Save')}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Overlay>
      {open && <PatientSearchLaunch close={() => true} />}
    </>
  );
};

export default PatientAdvancedSearchLaunch;
