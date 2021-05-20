import React from 'react';
import ReactDOM from 'react-dom';
import Root from './root.component';
import { match } from 'react-router-dom';

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
        match={sampleMatchProp}
        addressTemplate={{ results: [] }}
        currentSession={{} as any}
        patientIdentifiers={[]}
        relationshipTypes={{ results: [] }}
      />,
      div,
    );
  });
});
