import { Tab, TabList, TabPanel, TabPanels, Tabs, Button } from "@carbon/react";
import React, { useState } from "react";
import styles from "./bed-admission-tabs-styles.scss";
import { useTranslation } from "react-i18next";
import ActivePatientsTable from "./active-patients/active-patients-table.component";
import AdmittedPatientsList from "./admitted-patients/admitted-patients.component";
import DischargedPatientsList from "./discharged-patients/discharged-patients.componet";
import WardCard from "../ward-card/ward-card.component";

const BedAdmissionTabs: React.FC = () => {
  const { t } = useTranslation();
  const [admittedCount, setAdmittedCount] = useState(0);
  const [toAdmitCount, setToAdmitCount] = useState(0);
  const [toDischargeCount, setToDischargeCount] = useState(0);
  return (
    <>
      <div className={styles.cardContainer}>
        <WardCard
          label="patients"
          headerLabel="To Admit"
          value={admittedCount}
        />
        <WardCard
          label="patients"
          headerLabel="Admitted"
          value={toAdmitCount}
        />
        <WardCard
          label="patients"
          headerLabel="To Discharge"
          value={toDischargeCount}
        />
      </div>
      <div className={styles.container}>
        <Tabs>
          <TabList contained fullWidth className={styles.tabsContainer}>
            <Tab className={styles.tab}>
              {t("toAdmit", `To Admit (${admittedCount})`)}
            </Tab>
            <Tab className={styles.tab}>
              {t("admitted", `Admitted (${toAdmitCount})`)}
            </Tab>
            <Tab className={styles.tab}>
              {t("discharged", `To Discharge (${toDischargeCount})`)}
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <ActivePatientsTable
                status="pending"
                setPatientCount={setAdmittedCount}
              />
            </TabPanel>
            <TabPanel>
              <AdmittedPatientsList
                status="completed"
                setPatientCount={setToAdmitCount}
              />
            </TabPanel>
            <TabPanel>
              <DischargedPatientsList
                status=""
                setPatientCount={setToDischargeCount}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    </>
  );
};

export default BedAdmissionTabs;
