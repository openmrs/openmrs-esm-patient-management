import React, { useCallback, useMemo, useState } from 'react';
import {
  Button,
  Header,
  HeaderContainer,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  TooltipDefinition,
} from 'carbon-components-react';
import CloseFilled20 from '@carbon/icons-react/es//close--filled/20';
import { useTranslation } from 'react-i18next';
import styles from './visit-header.scss';
import {
  age,
  ConfigurableLink,
  useAssignedExtensions,
  useLayoutType,
  usePatient,
  useVisit,
} from '@openmrs/esm-framework';
import capitalize from 'lodash-es/capitalize';
import { launchPatientWorkspace } from './workspaces';
import VisitHeaderSideMenu from './visit-header-side-menu.component';

const PatientInfo = ({ patient, isTabletView }) => {
  const name = `${patient?.name?.[0].given?.join(' ')} ${patient?.name?.[0].family}`;
  const info = `${parseInt(age(patient.birthDate))}, ${capitalize(patient.gender)}`;
  const tooltipText = `${name} ${info}`;
  const truncate = !isTabletView && name.trim().length > 25;

  return truncate ? (
    <TooltipDefinition className={styles.tooltip} align="start" direction="bottom" tooltipText={tooltipText}>
      <span className={styles.patientName}>{name.slice(0, 25) + '...'}</span>
    </TooltipDefinition>
  ) : (
    <>
      <span className={styles.patientName}>{name} </span>
      <span className={styles.patientInfo}>
        {parseInt(age(patient.birthDate))}, {capitalize(patient.gender)}
      </span>
    </>
  );
};

const VisitHeader: React.FC = () => {
  const { t } = useTranslation();
  const { patient } = usePatient();
  const isTabletViewPort = useLayoutType() === 'tablet';
  const [showVisitHeader, setShowVisitHeader] = useState<boolean>(true);
  const [isSideMenuExpanded, setIsSideMenuExpanded] = useState(false);
  const navMenuItems = useAssignedExtensions('patient-chart-dashboard-slot').map((extension) => extension.id);

  const { currentVisit, isValidating } = useVisit(patient?.id);
  const launchStartVisitForm = React.useCallback(() => launchPatientWorkspace('start-visit-workspace-form'), []);
  const showHamburger = useMemo(
    () => isTabletViewPort && navMenuItems.length > 0,
    [navMenuItems.length, isTabletViewPort],
  );

  const isLoading = isValidating && currentVisit === null;
  const visitNotLoaded = !isValidating && currentVisit === null;
  const toggleSideMenu = useCallback(() => setIsSideMenuExpanded((prevState) => !prevState), []);

  const noActiveVisit = !isLoading && visitNotLoaded;

  const render = useCallback(() => {
    if (!showVisitHeader) {
      return null;
    }

    return (
      <>
        {Object.keys(patient ?? {}).length > 0 && (
          <Header aria-label="OpenMRS" className={styles.topNavHeader}>
            {showHamburger && (
              <HeaderMenuButton
                aria-label="Open menu"
                isCollapsible
                className={styles.headerMenuButton}
                onClick={(event) => {
                  event.stopPropagation();
                  toggleSideMenu();
                }}
                isActive={isSideMenuExpanded}
              />
            )}
            <ConfigurableLink className={styles.navLogo} to="${openmrsSpaBase}/home">
              <div className={styles.divider}>
                <svg role="img" width={110} height={40}>
                  <use xlinkHref="#omrs-logo-white"></use>
                </svg>
              </div>
            </ConfigurableLink>
            <div className={styles.navDivider} />
            <div className={styles.patientDetails}>
              <PatientInfo patient={patient} isTabletView={isTabletViewPort} />
            </div>
            <HeaderGlobalBar>
              {noActiveVisit && (
                <HeaderGlobalAction
                  className={styles.headerGlobalBarButton}
                  aria-label={t('startVisit', 'Start a visit')}
                  onClick={launchStartVisitForm}>
                  <Button as="div" className={styles.startVisitButton}>
                    {t('startVisit', 'Start a visit')}
                  </Button>
                </HeaderGlobalAction>
              )}
              <HeaderGlobalAction
                className={styles.headerGlobalBarCloseButton}
                aria-label={t('close', 'Close')}
                onClick={() => setShowVisitHeader((prevState) => !prevState)}>
                <CloseFilled20 />
              </HeaderGlobalAction>
            </HeaderGlobalBar>
            <VisitHeaderSideMenu isExpanded={isSideMenuExpanded} toggleSideMenu={toggleSideMenu} />
          </Header>
        )}
      </>
    );
  }, [
    launchStartVisitForm,
    isSideMenuExpanded,
    isTabletViewPort,
    noActiveVisit,
    patient,
    showHamburger,
    showVisitHeader,
    t,
    toggleSideMenu,
  ]);

  return <HeaderContainer render={render} />;
};

export default VisitHeader;
