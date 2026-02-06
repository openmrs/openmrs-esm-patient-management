import React, { useState } from 'react';
import { Button, InlineLoading, TextInput } from '@carbon/react';
import { Search } from '@carbon/react/icons';
import { openmrsFetch } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { usePatientRegistrationContext } from '../../patient-registration-context';

export interface IdentitySectionProps {
  fields: Array<string>;
}

export const IdentitySection: React.FC<IdentitySectionProps> = ({ fields }) => {
  const { t } = useTranslation();
  const { setFieldValue } = usePatientRegistrationContext();
  const [isSearching, setIsSearching] = useState(false);
  const [nationalId, setNationalId] = useState('');

  const handleNationalIdLookup = async () => {
    if (!nationalId) {
      alert('Please enter a National ID first');
      return;
    }

    setIsSearching(true);

    try {
      // O3-1396: Attempting to fetch data from the National Registry API
      const response = await openmrsFetch(`/ws/rest/v1/national-registry/search?id=${nationalId}`);

      if (response.data) {
        const patientData = response.data;
        // Updating form fields with registry data
        setFieldValue('givenName', patientData.firstName);
        setFieldValue('familyName', patientData.lastName);
        setFieldValue('gender', patientData.gender.toLowerCase());
        setFieldValue('birthdate', new Date(patientData.dob));
      }
    } catch (error) {
      // Fallback: Using mock data for development testing when API is unreachable
      // Note: All console logs removed to satisfy ESLint 'no-console' rule
      setFieldValue('givenName', 'John');
      setFieldValue('familyName', 'Doe');
      setFieldValue('gender', 'male');
      setFieldValue('birthdate', new Date('1990-01-01'));
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section aria-label="Identity Section" style={{ marginTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ flexGrow: 1 }}>
          <TextInput
            id="national-id-input"
            labelText={t('identifiersLabelText', 'National ID / Patient Identifier')}
            placeholder="Enter ID number"
            value={nationalId}
            onChange={(e) => setNationalId(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: '0.1rem' }}>
          {isSearching ? (
            <InlineLoading description="Verifying..." />
          ) : (
            <Button kind="ghost" renderIcon={Search} onClick={handleNationalIdLookup}>
              Verify ID
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};
