import React from 'react';
import { ConfigurableLink } from '@openmrs/esm-framework';

export default function Root() {
  return (
    <ConfigurableLink to="${openmrsSpaBase}/patient-registration" className="bx--side-nav__link">
      Patient Registration
    </ConfigurableLink>
  );
}
