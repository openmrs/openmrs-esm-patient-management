import React, { useState } from 'react';
import { ComboBox, Search, SkeletonIcon } from '@carbon/react';
import { useSearchClientRegistry } from './verification.resource';
import VerificationResults from '../verification-results/verification-results.component';
import { ErrorState } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';

const countries = ['Kenya', 'Uganda', 'Tanzania'];
const documentTypes = [
  { label: 'National ID', value: 'national-id' },
  { label: 'Birth certificate number', value: 'birth-certificate' },
  { label: 'Passport', value: 'passport' },
];

interface ClientRegistrySearch {
  searchTerm: string;
  county: string;
  documentType?: string;
}

interface PatientVerificationSearchProps {}

const PatientVerificationSearch: React.FC<PatientVerificationSearchProps> = () => {
  const { t } = useTranslation();
  const intiaialSearchParams: ClientRegistrySearch = {
    searchTerm: '',
    county: 'Kenya',
    documentType: '',
  };
  const [searchParameters, setSearchParameters] = useState<ClientRegistrySearch>(intiaialSearchParams);
  const { patient, isLoading, error } = useSearchClientRegistry(
    searchParameters.documentType,
    searchParameters.searchTerm,
  );

  return (
    <div>
      <h3>{t('patientVerification', 'Patient Verification')}</h3>
      <div style={{ display: 'flex', columnGap: '1rem', alignItems: 'flex-end' }}>
        <ComboBox
          ariaLabel="ComboBox"
          id="carbon-combobox-example"
          items={countries}
          label="Combo box menu options"
          titleText="Country"
          onChange={({ selectedItem }) => setSearchParameters({ ...searchParameters, county: selectedItem })}
          initialSelectedItem={searchParameters.county}
        />
        <ComboBox
          ariaLabel="ComboBox"
          id="carbon-combobox-example"
          items={documentTypes}
          label="Combo box menu options"
          titleText="Document type"
          disabled={!searchParameters.county}
          onChange={({ selectedItem }) =>
            setSearchParameters({ ...searchParameters, documentType: selectedItem.value })
          }
        />
        <Search
          disabled={!searchParameters.documentType}
          onChange={(e) => setSearchParameters({ ...searchParameters, searchTerm: e.target.value })}
          id="search-1"
          placeHolderText="Search"
        />
      </div>
      {isLoading && (
        <div style={{ display: 'flex', alignItems: 'center', minHeight: '15rem' }}>
          <SkeletonIcon style={{ width: '100%', height: '2rem', marginTop: '3rem' }} />
        </div>
      )}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', minHeight: '15rem' }}>
          <ErrorState headerTitle={t('searchError', 'Search error')} error={error} />
        </div>
      )}

      {patient && <VerificationResults client={patient} />}
    </div>
  );
};

export default PatientVerificationSearch;
