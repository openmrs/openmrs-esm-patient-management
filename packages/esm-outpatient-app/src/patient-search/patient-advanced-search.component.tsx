import React, { useState } from 'react';
import { Button, Form, ContentSwitcher, DatePicker, DatePickerInput, Switch, TextInput } from 'carbon-components-react';
import { useTranslation } from 'react-i18next';
import styles from './patient-advanced-search.component.scss';
import { useLayoutType } from '@openmrs/esm-framework';
import { ArrowLeft16 } from '@carbon/icons-react';
import { SearchMode } from '../types';

interface PatientSearchProps {
  handleSimpleSearch: (searchMode: SearchMode) => void;
}

const PatientAdvancedSearch: React.FC<PatientSearchProps> = ({ handleSimpleSearch }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
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
      <div className={`omrs-main-content ${styles.advancePatientSearchContainer}`}>
        <Button onClick={() => handleSimpleSearch(SearchMode.simple)} kind="ghost" tooltipAlignment="start">
          <ArrowLeft16 />
          <span className={styles.backToSimpleSearchText}>{t('backToSimpleSearch', 'Back to simple search')}</span>
        </Button>

        <div className={styles.contentSwitcherContainer}>
          <span>{t('match', 'Match')}</span>
          <ContentSwitcher size="sm" className={styles.searchSwitch}>
            <Switch name={'any'} text="Any" />
            <Switch name={'all'} text="All" />
          </ContentSwitcher>
          <span>{t('fields', `of the following fields :`)}</span>
        </div>

        <Form className={styles.formStyle}>
          <p className={styles.formTitle}>{t('name', 'Name')}</p>
          <div className={styles.formTextInput}>
            <TextInput
              light
              id="firstName"
              labelText={t('firstNameLabelText', 'First Name')}
              onChange={(event) => {
                setFName(event.target.value);
              }}
            />
          </div>

          <div className={styles.formTextInput}>
            <TextInput
              light
              id="middleName"
              labelText={t('middleNameLabelText', 'Middle Name')}
              onChange={(event) => {
                setMName(event.target.value);
              }}
            />
          </div>

          <div className={styles.formTextInput}>
            <TextInput
              light
              id="lastName"
              labelText={t('lastNameLabelText', 'Last Name')}
              onChange={(event) => {
                setLName(event.target.value);
              }}
            />
          </div>

          <p className={styles.formTitle}>{t('personalDetails', 'Personal Details')}</p>
          <span className={styles.label01}>{t('sex', 'Sex')}</span>
          <ContentSwitcher size="sm" className={styles.genderSwitch}>
            <Switch name={'any'} text={t('any', 'Any')} />
            <Switch name={'male'} text={t('male', 'Male')} />
            <Switch name={'female'} text={t('female', 'Female')} />
          </ContentSwitcher>

          <div className={styles.formTextInput}>
            <DatePicker dateFormat="m/d/Y" datePickerType="single" light>
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

          <div className={styles.formTextInput}>
            <TextInput
              light
              id="phoneNumber"
              labelText={t('phoneNumberLabelText', 'Phone Number')}
              onChange={(event) => {
                setPhoneNumber(event.target.value);
              }}
            />
          </div>

          <div className={styles.formTextInput}>
            <TextInput
              light
              id="postCode"
              labelText={t('postCodeLabelText', 'Post Code')}
              onChange={(event) => {
                setPostalCode(event.target.value);
              }}
            />
          </div>

          <p className={styles.formTitle}>{t('lastVisit', 'Last Visit')}</p>
          <DatePicker dateFormat="m/d/Y" datePickerType="single" light className={styles.formTextInput}>
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
      </div>
      <div className={styles.buttonsGroup}>
        <Button kind="secondary" size="lg">
          {t('cancel', 'Cancel')}
        </Button>
        <Button size="lg" onClick={() => handleNewSearch()}>
          {t('search', 'Search')}
        </Button>
      </div>
    </>
  );
};

export default PatientAdvancedSearch;
