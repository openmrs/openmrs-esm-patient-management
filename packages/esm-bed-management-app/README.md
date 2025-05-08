# Bed Management App

A frontend module for managing beds in a facility. It allows creating
wards and beds in those wards: Configuring beds and where they are located in the wards. It does not provide any functionality
related to patients, such as assigning patients to beds. This provides a simple UI for setting up names of beds and where those beds can be found. Then the Ward App uses this information. 

So for example:
* Hospital X
  * IPD
    * Ward ZZZZ
      * Bed 1
      * Bed 2
          * etc

Requires [openmrs-module-bedmanagement](https://github.com/openmrs/openmrs-module-bedmanagement)
to be installed on the OpenMRS server.

See also the Ward App and it's helpful README here: [esm-ward-app](https://github.com/openmrs/openmrs-esm-patient-management/tree/main/packages/esm-ward-app) The Ward App offers the fuller UI for patient management across beds.
