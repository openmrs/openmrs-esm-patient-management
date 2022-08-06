import React from 'react';
import { createRoot } from 'react-dom/client';
import Root from './root.component';

window['getOpenmrsSpaBase'] = jest.fn().mockImplementation(() => '/');

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    validator: jest.fn(),
  };
});

describe('root component', () => {
  it('renders without crashing', () => {
    const div = document.createElement('div');
    const root = createRoot(div);

    root.render(
      <Root
        savePatientForm={jest.fn()}
        addressTemplate={{ results: [] }}
        currentSession={{} as any}
        relationshipTypes={{ results: [] }}
        identifierTypes={[]}
        isOffline={false}
      />,
    );
  });
});
