import { Toggletip, ToggletipButton, ToggletipContent, Tooltip } from '@carbon/react';
import { isDesktop, useLayoutType } from '@openmrs/esm-framework';
import React, { type ReactNode } from 'react';
import styles from '../ward-patient-card.scss';

interface WardPatientResponsiveTooltipProps {
  children: ReactNode;
  tooltipContent: ReactNode;
}

/**
 * This component acts as a Tooltip on desktop and a Toggletip on mobile.
 */
const WardPatientResponsiveTooltip: React.FC<WardPatientResponsiveTooltipProps> = ({ children, tooltipContent }) => {
  const layout = useLayoutType();
  if (isDesktop(layout)) {
    return (
      <Tooltip description={tooltipContent} className={styles.responsiveTooltip}>
        {children}
      </Tooltip>
    );
  } else {
    return (
      <Toggletip className={styles.responsiveTooltip}>
        <ToggletipButton>{children}</ToggletipButton>
        <ToggletipContent>{tooltipContent}</ToggletipContent>
      </Toggletip>
    );
  }
};

export default WardPatientResponsiveTooltip;
