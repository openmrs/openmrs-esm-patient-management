:wave:	*New to our project? Be sure to review the [OpenMRS 3 Frontend Developer Documentation](https://openmrs.github.io/openmrs-esm-core/#/). You may find the [Map of the Project](https://openmrs.github.io/openmrs-esm-core/#/main/map) especially helpful.* :teacher:	


![Node.js CI](https://github.com/openmrs/openmrs-esm-patient-management/workflows/Node.js%20CI/badge.svg)


# OpenMRS Patient Management

This is a [Lerna](https://lerna.js.org/) project containing patient management frontend modules which deal with creating, searching, and listing patients. This package handles the following:

-  [@openmrs/esm-patient-search-app](packages/esm-patient-search-app)
-  [@openmrs/esm-patient-registration-app](packages/esm-patient-registration-app)
-  [@openmrs/esm-patient-list-app](packages/esm-patient-list-app)
-  [@openmrs/esm-outpatient-app](packages/esm-outpatient-app)

## Repository Development


### Prerequisites

- [Node](https://nodejs.org/en/download)
- yarn ```sh npm install yarn -g ```
### Getting started

To install and setup the repository once cloned just use the following command

```sh
npx lerna bootstrap
```

To develop on a specific package e.g [@openmrs/esm-patient-search-app](packages/esm-patient-search-app)

```sh
npx openmrs develop --sources 'packages/esm-patient-search-app'
```

You can always use regex

```sh
npx openmrs develop --sources 'packages/esm-patient-{package1,package2}-app/'
```


### Building

For building the code just run

```sh
npx lerna run build

```


### Tests

To verify that all the test run

```sh
yarn test or npm test
```

## Deployment

The `main` branch of this repo is deployed in a [demo environment](https://openmrs-spa.org/openmrs/spa).

## Configuration

This module is designed to be driven by configuration files.

## Resources

- [JIRA Epic](https://issues.openmrs.org/browse)
