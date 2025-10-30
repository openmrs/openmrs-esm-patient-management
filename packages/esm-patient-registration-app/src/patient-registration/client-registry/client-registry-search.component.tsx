import React, { useState } from 'react';
import { Button, TextInput, InlineLoading, InlineNotification } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import { useFormikContext } from 'formik';
import styles from '../patient-registration.scss';
import { requestCustomOtp, validateCustomOtp, fetchClientRegistryData } from './client-registry.resource';
import { applyClientRegistryMapping } from './map-client-registry-to-form-utils';

export interface ClientRegistryLookupSectionProps {
  onClientVerified?: () => void;
}

const ClientRegistryLookupSection: React.FC<ClientRegistryLookupSectionProps> = ({ onClientVerified }) => {
  const { setFieldValue, values } = useFormikContext<any>();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [error, setError] = useState<string>('');

  const locationUuid = '18c343eb-b353-462a-9139-b16606e6b6c2';

  async function withTimeout<T>(promise: Promise<T>, ms = 10000): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);
    try {
      const response = await promise;
      return response;
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error('Request timeout');
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  }

  const handleFetchCR = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        identificationNumber: identifier,
        identificationType: 'National ID',
        locationUuid,
      };
      const result = await withTimeout(fetchClientRegistryData(payload));
      const patients = Array.isArray(result) ? result : [];

      if (patients.length === 0) {
        throw new Error('No matching patient found in Client Registry.');
      }

      const patient = patients[0];

      // Debug: Show what's in the CR payload
      // debugCRMapping(patient);

      // Apply the enhanced mapping
      applyClientRegistryMapping(patient, setFieldValue);

      showSnackbar({
        kind: 'success',
        title: 'Client Data Loaded',
        subtitle: `Patient ${patient.first_name} ${patient.last_name} fetched successfully. Loaded education, next of kin, and relationships.`,
      });

      // Log the final form values for debugging
      // setTimeout(() => {
      //   console.log('Final form values after mapping:', {
      //     // Basic info
      //     givenName: values.givenName,
      //     familyName: values.familyName,
      //     gender: values.gender,
      //     birthdate: values.birthdate,

      //     // Education & Occupation
      //     education: values.academicOccupation?.highestLevelEducation,
      //     occupation: values.academicOccupation?.occupation,
      //     civilStatus: values.civilStatus,

      //     // Next of Kin
      //     nextOfKin: values.nextOfKin,

      //     // Relationships
      //     relationships: values.relationships,

      //     // Contact
      //     phone: values.phone,
      //     email: values.email,

      //     // Address
      //     county: values.county,
      //     subCounty: values.subCounty,
      //     ward: values.ward,
      //     village: values.village,
      //   });
      // }, 1000);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch client data';
      setError(errorMessage);
      showSnackbar({
        kind: 'error',
        title: 'Fetch Failed',
        subtitle: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    if (!identifier.trim()) {
      setError('Please enter a valid National/Alien ID');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        identificationNumber: identifier,
        identificationType: 'National ID',
        locationUuid,
      };
      const response = await withTimeout(requestCustomOtp(payload));
      setSessionId(response.sessionId);
      setOtpSent(true);

      showSnackbar({
        kind: 'success',
        title: 'OTP sent successfully',
        subtitle: `A code was sent to ${response.maskedPhone}`,
      });
    } catch (err) {
      const errorMessage = err.message || 'Failed to send OTP';
      setError(errorMessage);
      showSnackbar({
        kind: 'error',
        title: 'Error sending OTP',
        subtitle: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the OTP code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const payload = {
        sessionId,
        otp,
        locationUuid,
      };
      await withTimeout(validateCustomOtp(payload));

      setOtpVerified(true);
      onClientVerified?.();
      showSnackbar({
        kind: 'success',
        title: 'OTP Verified',
        subtitle: 'You can now fetch data from Client Registry.',
      });
    } catch (err) {
      const errorMessage = err.message || 'OTP verification failed';
      setError(errorMessage);
      showSnackbar({
        kind: 'error',
        title: 'OTP Verification Failed',
        subtitle: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <h4 className={styles.sectionTitle}>Client Registry Verification</h4>

      {error && (
        <div className={styles.notificationSpacing}>
          <InlineNotification title="Error" subtitle={error} kind="error" lowContrast />
        </div>
      )}

      <div className={styles.fieldGroup}>
        <TextInput
          id="client-registry-id"
          labelText="National ID or Alien ID"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          disabled={otpSent}
          placeholder="Enter identification number"
        />
      </div>

      <div style={{ marginTop: '0.75rem' }}>
        {!otpSent ? (
          <Button kind="secondary" onClick={handleSendOtp} disabled={loading}>
            {loading ? <InlineLoading description="Sending..." /> : 'Send OTP'}
          </Button>
        ) : (
          <>
            <div style={{ marginTop: '0.75rem' }}>
              <TextInput
                id="otp-input"
                labelText="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={otpVerified}
                placeholder="Enter the code sent to your phone"
              />
            </div>

            <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
              {!otpVerified ? (
                <Button size="sm" kind="secondary" onClick={handleVerifyOtp} disabled={loading}>
                  {loading ? <InlineLoading description="Verifying..." /> : 'Verify OTP'}
                </Button>
              ) : (
                <Button kind="primary" onClick={handleFetchCR} disabled={loading}>
                  {loading ? <InlineLoading description="Fetching..." /> : 'Fetch Client Registry Data'}
                </Button>
              )}
              {!otpVerified && (
                <Button size="sm" kind="tertiary" onClick={() => setOtpSent(false)}>
                  Change ID
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ClientRegistryLookupSection;
