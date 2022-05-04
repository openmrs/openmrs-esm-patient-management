import React from 'react';
import ReactDOM from 'react-dom';
import Root from './root.component';
import { match } from 'react-router-dom';
import { Session } from '@openmrs/esm-framework';

window['getOpenmrsSpaBase'] = jest.fn().mockImplementation(() => '/');

const path = `/patient/:patientUuid/edit`;
const sampleMatchProp: match<{ patientUuid: string }> = {
  isExact: false,
  path,
  url: path.replace(':patientUuid', '1'),
  params: { patientUuid: '1' },
};

describe('root component', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    ReactDOM.render(
      <Root
        savePatientForm={jest.fn()}
        addressTemplate={{ results: [] }}
        currentSession={{} as Session}
        identifierTypes={[]}
        relationshipTypes={{ results: [] }}
        isOffline={false}
      />,
      div,
    );
  });
});
