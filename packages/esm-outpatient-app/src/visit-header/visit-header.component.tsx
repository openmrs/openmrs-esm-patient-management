import React, { useMemo, useState } from 'react';
import {
  Button,
  Header,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderName,
} from 'carbon-components-react';
import Search20 from '@carbon/icons-react/lib/search/20';
import CloseFilled20 from '@carbon/icons-react/es//close--filled/20';
import { useTranslation } from 'react-i18next';
import styles from './visit-header.scss';
import { age, ConfigurableLink, useAssignedExtensions, useLayoutType, usePatient } from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import isEmpty from 'lodash-es/isEmpty';

interface VisitHeadeProps {}

const VisitHeader: React.FC<VisitHeadeProps> = () => {
  const { t } = useTranslation();
  const { patient } = usePatient();
  const isTabletViewPort = useLayoutType() === 'tablet';
  const [showVisitHeader, setShowVisitHeader] = useState<boolean>(true);
  const navMenuItems = useAssignedExtensions('patient-chart-dashboard-slot').map((e) => e.id);

  const showHamburger = useMemo(
    () => isTabletViewPort && navMenuItems.length > 0,
    [navMenuItems.length, isTabletViewPort],
  );

  if (!showVisitHeader) {
    return null;
  }

  return (
    <>
      {!isEmpty(patient) && (
        <Header aria-label="OpenMRS" className={styles.topNavHeader}>
          {showHamburger && (
            <HeaderMenuButton
              aria-label="Open menu"
              isCollapsible
              className={styles.headerMenuButton}
              onClick={(event) => {
                event.stopPropagation();
              }}
            />
          )}
          <ConfigurableLink className={styles.navLogo} to="${openmrsSpaBase}/home">
            <div className={styles.divider}>
              <svg role="img" width={110} height={40}>
                <use xlinkHref="#omrs-logo-white"></use>
              </svg>
            </div>
          </ConfigurableLink>

          <div className={styles.patientDetails}>
            <span className={styles.patientName}>
              {`${patient?.name?.[0].given?.join(' ')} ${patient?.name?.[0].family}`}{' '}
            </span>
            <span className={styles.patientInfo}>
              {parseInt(age(patient.birthDate))}, {capitalize(patient.gender)}
            </span>
          </div>
          <HeaderGlobalBar>
            <HeaderGlobalAction aria-label="Search" onClick={() => {}}>
              <Search20 />
            </HeaderGlobalAction>
            <HeaderGlobalAction
              className={styles.headerGlobalBarButton}
              aria-label={t('startVisit', 'Start a visit')}
              onClick={() => {}}>
              <Button as="div" className={styles.startVisitButton}>
                {t('startVisit', 'Start a visit')}
              </Button>
            </HeaderGlobalAction>
            <HeaderGlobalAction
              className={styles.headerGlobalBarButton}
              aria-label={t('close', 'Close')}
              onClick={() => setShowVisitHeader((prevState) => !prevState)}>
              <CloseFilled20 />
            </HeaderGlobalAction>
          </HeaderGlobalBar>
        </Header>
      )}
    </>
  );
};

export default VisitHeader;
