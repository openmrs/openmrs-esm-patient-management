![Node.js CI](https://github.com/openmrs/openmrs-esm-patient-management/workflows/Node.js%20CI/badge.svg)


# OpenMRS Patient Management

This is a [Lerna](https://lerna.js.org/) project containing patient management. This package handles the following

-  [@openmrs/esm-patient-search-app](packages/esm-patient-search-app)

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
npx openmrs develop --sources 'packages/apps/esm-patient-search-app'
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