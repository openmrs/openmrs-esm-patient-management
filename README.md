:wave: *New to our project? Be sure to review the [OpenMRS 3 Frontend Developer Documentation](https://openmrs.github.io/openmrs-esm-core/#/). You may find the [Map of the Project](https://openmrs.github.io/openmrs-esm-core/#/main/map) especially helpful.* :teacher:

![Node.js CI](https://github.com/openmrs/openmrs-esm-patient-management/workflows/Node.js%20CI/badge.svg)

# OpenMRS Patient Management

This repository contains frontend modules for the OpenMRS SPA. These modules relate to registering and editing patients, searching for existing patients, creating and managing patient lists and managing patient queues in an outpatient setting. The modules within this repository include:

- [Active visits app](packages/esm-active-visits-app/)
- [Outpatient app](packages/esm-outpatient-app/README.md)
- [Patient search](packages/esm-patient-search-app)
- [Patient registration](packages/esm-patient-registration-app)
- [Patient list](packages/esm-patient-list-app)

## Setup

Check out the developer documentation [here](http://o3-dev.docs.openmrs.org).

This monorepo uses [yarn](https://yarnpkg.com) and [lerna](https://github.com/lerna/lerna).

To start a dev server running all the modules simultaneously, run:

```bash
yarn start
```

This command uses the [openmrs](https://www.npmjs.com/package/openmrs) tooling to fire up a dev server running `esm-patient-chart` as well as the specified module.

Note that this is very resource-intensive.

To start a dev server for a specific module, run:

```bash
yarn start --sources 'packages/esm-<insert-package-name>-app'
```

You could provide `yarn start` with as many `sources` arguments as you require. For example, to run the patient registration and patient search modules only, use:

```bash
yarn start --sources 'packages/esm-patient-search-app' --sources 'packages/esm-patient-registration-app'
```

## Contributing

Please read our [contributing](http://o3-dev.docs.openmrs.org/#/getting_started/contributing) guide.

## Running tests

To run tests, use:

```sh
yarn test
```

## Deployment

The `main` branch of this repo is deployed in a [demo environment](https://openmrs-spa.org/openmrs/spa).

## Configuration

This module is designed to be driven by configuration files.
